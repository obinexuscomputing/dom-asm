import { Token, HTMLTokenizer } from "../tokenizer/index";
import { ValidationResult, Validator } from "../validator/index";

// Basic node interface that all node types extend
interface BaseNode {
  type: string;
  children: ASTNode[];
  parent: ASTNode | null;
}

// Specific node type interfaces
interface ElementNode extends BaseNode {
  type: "Element";
  name: string;
  attributes: Record<string, string>;
}

interface TextNode extends BaseNode {
  type: "Text";
  value: string; // Explicitly required
}

interface CommentNode extends BaseNode {
  type: "Comment";
  value: string; // Explicitly required
}

// Union type for all possible nodes
type ASTNode = ElementNode | TextNode | CommentNode;

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

// Type guard functions
function isTextNode(node: ASTNode): node is TextNode {
  return node.type === "Text";
}

function isElementNode(node: ASTNode): node is ElementNode {
  return node.type === "Element";
}

function isCommentNode(node: ASTNode): node is CommentNode {
  return node.type === "Comment";
}

type ErrorHandler = (error: ParserError) => void;

export class Parser {
  private tokenizer: HTMLTokenizer;
  private validator: Validator;
  private errorHandler: ErrorHandler | null = null;
  private shouldThrow: boolean = true;

  constructor(options = { throwOnError: true }) {
    this.tokenizer = new HTMLTokenizer("");
    this.validator = new Validator();
    this.shouldThrow = options.throwOnError;
  }

  setErrorHandler(handler: ErrorHandler): void {
    this.errorHandler = handler;
    this.shouldThrow = false;
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

  private isWhitespace(str: string): boolean {
    return /^\s*$/.test(str);
  }

  private createRootNode(): ElementNode {
    return {
      type: "Element",
      name: "root",
      attributes: {},
      children: [],
      parent: null
    };
  }

  public parse(input: string): ASTNode {
    this.tokenizer = new HTMLTokenizer(input);
    const tokens = this.tokenizer.tokenize();
    const ast = this.buildASTWithRecovery(tokens);
    return this.cleanWhitespace(ast);
  }

  private cleanWhitespace(node: ASTNode): ASTNode {
    if (node.children.length > 0) {
      node.children = node.children.filter(child => 
        !(isTextNode(child) && this.isWhitespace(child.value))
      );
      
      node.children.forEach(child => this.cleanWhitespace(child));
    }
    return node;
  }

  private buildASTWithRecovery(tokens: Token[]): ASTNode {
    const root = this.createRootNode();
    const stack: ElementNode[] = [root];
    let currentParent = root;
    let recoveryMode = false;

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
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
            recoveryMode = false;
            break;
          }
          
          case "EndTag": {
            if (recoveryMode) continue;

            const matchingStartIndex = stack.findIndex(node => node.name === token.name);
            if (matchingStartIndex === -1) {
              throw new ParserError(
                `Unmatched end tag: </${token.name}>. Expected </${currentParent.name}>.`,
                token,
                i
              );
            }

            while (stack.length > matchingStartIndex) {
              stack.pop();
            }
            currentParent = stack[stack.length - 1];
            break;
          }

          case "Text": {
            if (!recoveryMode) {
              const textNode: TextNode = {
                type: "Text",
                value: token.value,
                children: [],
                parent: currentParent
              };
              currentParent.children.push(textNode);
            }
            break;
          }

          case "Comment": {
            if (!recoveryMode) {
              const commentNode: CommentNode = {
                type: "Comment",
                value: token.value,
                children: [],
                parent: currentParent
              };
              currentParent.children.push(commentNode);
            }
            break;
          }
        }
      } catch (error) {
        if (error instanceof ParserError) {
          this.handleError(error);
          if (!this.shouldThrow) {
            recoveryMode = true;
            continue;
          }
          throw error;
        }
        throw error;
      }
    }

    // Handle unclosed tags
    while (stack.length > 1) {
      const unclosedNode = stack.pop()!;
      this.handleError(
        new ParserError(
          `Unclosed tag: <${unclosedNode.name}>`,
          { type: "StartTag", name: unclosedNode.name, attributes: {} },
          tokens.length
        )
      );
    }

    return root;
  }
}

export { Parser, ParserError, type ASTNode, type ElementNode, type TextNode, type CommentNode };