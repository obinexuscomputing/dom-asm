import { Token, HTMLTokenizer } from "../tokenizer/index";
import { AST, ASTNode } from "../ast/index";
import { ValidationResult, Validator } from "../validator/index";

type ErrorHandler = (error: ParserError) => void;

interface ElementNode extends ASTNode {
  type: "Element";
  name: string;
  attributes: Record<string, string>;
}

interface TextNode extends ASTNode {
  type: "Text";
  value: string;
}

interface CommentNode extends ASTNode {
  type: "Comment";
  value: string;
}

function isTextNode(node: ASTNode): node is TextNode {
  return node.type === "Text";
}

function isElementNode(node: ASTNode): node is ElementNode {
  return node.type === "Element";
}

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

export class HTMLParser {
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
    this.shouldThrow = false;
  }

  private handleError(error: ParserError, quiet = false): void {
    if (this.errorHandler) {
      this.errorHandler(error);
    } else {
      if (this.shouldThrow) {
        throw error;
      }
      if (!quiet) {
        console.error(`Error at position ${error.position}: ${error.message}`);
        console.error(`Problematic token: ${JSON.stringify(error.token)}`);
      }
    }
  }

  private isWhitespace(str: string): boolean {
    return /^\s*$/.test(str);
  }

  public parse(input: string): ASTNode {
    this.tokenizer = new HTMLTokenizer(input);
    const tokens = this.tokenizer.tokenize();
    const ast = this.buildASTWithRecovery(tokens);
    this.cleanWhitespace(ast);
    return ast;
  }

  private cleanWhitespace(node: ASTNode): void {
    if (node.children) {
      // First clean children recursively before filtering current level
      node.children.forEach(child => this.cleanWhitespace(child));
      
      // Then filter whitespace at current level
      node.children = node.children.filter(child => {
        if (isTextNode(child)) {
          return !this.isWhitespace(child.value);
        }
        return true;
      });
    }
  }

  private buildASTWithRecovery(tokens: Token[]): ASTNode {
    const root = this.astBuilder.getRoot();
    const stack: ElementNode[] = [root as ElementNode];
    let currentParent = root;
    let skipUntilTag: string | null = null;

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      // Skip tokens if we're in recovery mode
      if (skipUntilTag && token.type === "EndTag" && token.name === skipUntilTag) {
        skipUntilTag = null;
        continue;
      }
      if (skipUntilTag) continue;

      try {
        switch (token.type) {
          case "StartTag": {
            const elementNode: ElementNode = {
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
              node.name === token.name
            );

            if (matchingStartIndex === -1) {
              throw new ParserError(
                `Unmatched end tag: </${token.name}>. Expected </${
                  isElementNode(currentParent) ? currentParent.name : "unknown"
                }>.`,
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
            const textNode: TextNode = {
              type: "Text",
              value: token.value,
              children: [],
              parent: currentParent
            };
            currentParent.children.push(textNode);
            break;
          }

          case "Comment": {
            const commentNode: CommentNode = {
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
          if (!this.shouldThrow) {
            // Set recovery mode to skip until matching end tag
            if (isElementNode(currentParent)) {
              skipUntilTag = currentParent.name;
            }
            continue;
          }
          throw error;
        }
        throw error;
      }
    }

    // Handle any unclosed tags at the end
    while (stack.length > 1) {
      const unclosedNode = stack.pop()!;
      this.handleError(
        new ParserError(
          `Unclosed tag: <${unclosedNode.name}>`,
          { type: "StartTag", name: unclosedNode.name, attributes: {} },
          tokens.length
        ),
        true // Quiet mode for unclosed tags
      );
    }

    return root;
  }
}