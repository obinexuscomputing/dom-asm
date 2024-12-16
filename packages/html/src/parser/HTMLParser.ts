import { HTMLAST, HTMLASTNode, HTMLASTBuilder } from "../ast/HTMLAST";
import { HTMLToken, HTMLTokenizer } from "../tokenizer";

export class HTMLParserError extends Error {
  public token: HTMLToken;
  public position: number;

  constructor(message: string, token: HTMLToken, position: number) {
    super(message);
    this.name = "HTMLParserError";
    this.token = token;
    this.position = position;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, HTMLParserError);
    }
  }
}

export interface HTMLParserOptions {
  throwOnError?: boolean;
  errorHandler?: (error: HTMLParserError) => void;
}

export class HTMLParser {
  private tokenizer: HTMLTokenizer;
  private options: HTMLParserOptions;

  constructor(options: HTMLParserOptions = { throwOnError: true }) {
    this.tokenizer = new HTMLTokenizer("");
    this.options = options;
  }

  public parse(input: string): HTMLAST {
    const tokenizer = new HTMLTokenizer(input);
    const tokens = tokenizer.tokenize();
  
    try {
      const astBuilder = new HTMLASTBuilder(tokens);
      return astBuilder.buildAST();
    } catch (error) {
      if (this.options.throwOnError) throw error;
      if (this.options.errorHandler) this.options.errorHandler(error as HTMLParserError);
  
      // Return a default AST for recovery
      return {
        root: { type: "Element", name: "root", children: [] },
        metadata: { nodeCount: 0, elementCount: 0, textCount: 0, commentCount: 0 },
      };
    }
  }
  
  public setErrorHandler(handler: (error: HTMLParserError) => void): void {
    this.options.errorHandler = handler;
  }
  

  public buildAST(tokens: HTMLToken[]): HTMLASTNode {
    const root = new HTMLASTNode("Element", [], { name: "root" });
    const stack: HTMLASTNode[] = [root];
    let currentParent = root;
  
    for (const token of tokens) {
      if (token.type === "StartTag") {
        const newNode = new HTMLASTNode("Element", [], { name: token.name, attributes: token.attributes });
        currentParent.children.push(newNode);
        if (!token.selfClosing) {
          stack.push(newNode);
          currentParent = newNode;
        }
      } else if (token.type === "EndTag") {
        if (stack.length > 1 && currentParent.name !== token.name) {
          console.warn(`Skipping unmatched end tag: ${token.name}`);
        } else if (stack.length > 1) {
          stack.pop();
          currentParent = stack[stack.length - 1];
        } else {
          console.warn(`Unmatched end tag: ${token.name}`);
        }
      } else if (token.type === "Text" || token.type === "Comment") {
        currentParent.children.push(
          new HTMLASTNode(token.type, [], { value: token.value })
        );
      }
    }
  
    if (stack.length > 1) {
      const lastToken = tokens[tokens.length - 1] || { name: "unknown", line: -1, column: -1 };
      throw new HTMLParserError("Unclosed tags detected", lastToken, stack.length);
    }
  
    return root;
  }
  
  
  

}
