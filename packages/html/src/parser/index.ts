import { Token, HTMLTokenizer } from "../tokenizer/index";
import { AST, ASTNode } from "../ast/index";
import { ValidationResult, Validator } from "../validator/index";

type ErrorHandler = (error: ParserError) => void;

export class ParserError extends Error {
  token: Token;
  position: number;
  constructor(message: string, token: Token, position: number) {
    super(message);
    this.name = "ParserError";
    this.token = token;
    this.position = position;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ParserError);
    }
  }
}

export class Parser {
  private tokenizer: HTMLTokenizer;
  private astBuilder: AST;
  private validator: Validator;
  private errorHandler: ErrorHandler | null = null;
  private shouldThrow: boolean = true;

  constructor(options = { throwOnError: true }) {
    this.tokenizer = new HTMLTokenizer("");
    this.astBuilder = new AST();
    this.validator = new Validator();
    this.shouldThrow = options.throwOnError;
  }

  setErrorHandler(handler: ErrorHandler): void {
    this.errorHandler = handler;
    this.shouldThrow = false; // When error handler is set, don't throw
  }

  private handleError(error: ParserError): void {
    if (this.errorHandler) {
      this.errorHandler(error);
    } else {
      if (this.shouldThrow) {
        throw error;
      }
      console.error(`Error at position ${error.position}: ${error.message}`);
      console.error(`Problematic token: ${JSON.stringify(error.token)}`);
    }
  }

  public parse(input: string): ASTNode {
    this.tokenizer = new HTMLTokenizer(input);
    const tokens = this.tokenizer.tokenize();
    return this.buildASTWithRecovery(tokens);
  }

  private buildASTWithRecovery(tokens: Token[]): ASTNode {
    const stack: ASTNode[] = [this.astBuilder.getRoot()];
    let currentParent = stack[0];

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      try {
        switch (token.type) {
          case "StartTag": {
            const elementNode: ASTNode = {
              type: "Element",
              name: token.name,
              attributes: token.attributes,
              children: [],
              parent: currentParent
            };
            currentParent.children.push(elementNode);
            stack.push(elementNode);
            currentParent = elementNode;
            break;
          }
          
          case "EndTag": {
            const matchingStartIndex = stack.findIndex(node => 
              node.type === "Element" && node.name === token.name
            );

            if (matchingStartIndex === -1) {
              throw new ParserError(
                `Unmatched end tag: </${token.name}>. Expected </${currentParent.name}>.`,
                token,
                i
              );
            }

            // Pop all nodes up to and including the matching start tag
            while (stack.length > matchingStartIndex) {
              stack.pop();
            }
            currentParent = stack[stack.length - 1];
            break;
          }

          case "Text": {
            const textNode: ASTNode = {
              type: "Text",
              value: token.value,
              children: [],
              parent: currentParent
            };
            currentParent.children.push(textNode);
            break;
          }

          case "Comment": {
            const commentNode: ASTNode = {
              type: "Comment",
              value: token.value,
              children: [],
              parent: currentParent
            };
            currentParent.children.push(commentNode);
            break;
          }
        }
      } catch (error) {
        if (error instanceof ParserError) {
          this.handleError(error);
          // Continue parsing after error if not throwing
          if (!this.shouldThrow) {
            continue;
          }
        }
        throw error;
      }
    }

    // Handle any unclosed tags at the end
    while (stack.length > 1) {
      const unclosedNode = stack.pop()!;
      if (unclosedNode.type === "Element") {
        this.handleError(
          new ParserError(
            `Unclosed tag: <${unclosedNode.name}>`,
            { type: "StartTag", name: unclosedNode.name, attributes: {} },
            tokens.length
          )
        );
      }
    }

    return stack[0];
  }
}