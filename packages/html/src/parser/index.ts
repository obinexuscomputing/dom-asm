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

  constructor() {
    this.tokenizer = new HTMLTokenizer("");
    this.astBuilder = new AST();
    this.validator = new Validator();
  }

  setErrorHandler(handler: ErrorHandler): void {
    this.errorHandler = handler;
  }

  private handleError(error: ParserError): void {
    if (this.errorHandler) {
      this.errorHandler(error);
    } else {
      console.error(`Error at position ${error.position}: ${error.message}`);
      console.error(`Problematic token: ${JSON.stringify(error.token)}`);
    }
  }

  public parse(input: string): {
    children: any; ast: ASTNode; validationResult: ValidationResult 
} {
    this.tokenizer = new HTMLTokenizer(input);
    const tokens = this.tokenizer.tokenize();
    const ast = this.buildASTWithRecovery(tokens);
    const validationResult = this.validator.validateAST(ast);
    return { ast, validationResult };
  }

  private buildASTWithRecovery(tokens: Token[]): ASTNode {
    const stack: ASTNode[] = [];
    let root = this.astBuilder.getRoot();
    let currentParent = root;

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      try {
        switch (token.type) {
          case "StartTag":
            const elementNode: ASTNode = {
              type: "Element",
              name: token.name,
              attributes: token.attributes,
              children: [],
              parent: currentParent,
            };
            currentParent.children.push(elementNode);
            stack.push(elementNode);
            currentParent = elementNode;
            break;

          case "EndTag":
            if (currentParent.name === token.name) {
              stack.pop();
              currentParent = stack.length > 0 ? stack[stack.length - 1] : root;
            } else {
              throw new ParserError(
                `Unmatched end tag: </${token.name}>. Expected </${currentParent.name}>.`,
                token,
                i
              );
            }
            break;

          case "Text":
            const textNode: ASTNode = {
              type: "Text",
              value: token.value,
              children: [],
              parent: currentParent,
            };
            currentParent.children.push(textNode);
            break;

          case "Comment":
            const commentNode: ASTNode = {
              type: "Comment",
              value: token.value,
              children: [],
              parent: currentParent,
            };
            currentParent.children.push(commentNode);
            break;

          default:
            throw new ParserError(`Unsupported token type: ${token.type}`, token, i);
        }
      } catch (error) {
        if (error instanceof ParserError) {
          this.handleError(error);
        } else {
          console.error("Unexpected error during AST construction:", error);
        }
      }
    }

    return root;
  }
}
