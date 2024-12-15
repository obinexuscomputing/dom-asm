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
    const root: HTMLASTNode = { type: "Element", name: "root", children: [] };
    const stack: HTMLASTNode[] = [root];
    let currentParent = root;

    for (const token of tokens) {
      switch (token.type) {
        case "Doctype":
          currentParent.children?.push({
            type: "Doctype",
            value: token.value,
          });
          break;

        case "StartTag":
          const elementNode: HTMLASTNode = {
            type: "Element",
            name: token.name,
            attributes: token.attributes,
            children: [],
          };
          currentParent.children?.push(elementNode);
          stack.push(elementNode);
          currentParent = elementNode;
          break;

        case "EndTag":
          if (stack.length > 1) {
            stack.pop();
            currentParent = stack[stack.length - 1];
          } else {
            if (this.options.errorHandler) {
              const error = new HTMLParserError(`Unmatched end tag: ${token.name}`, token, stack.length);
              this.options.errorHandler(error);
            }
          }
          break;

        case "Text":
        case "Comment":
          currentParent.children?.push({
            type: token.type,
            value: token.value,
          });
          break;
      }
    }

    if (stack.length > 1) {
      throw new HTMLParserError("Unclosed tags detected", tokens[tokens.length - 1], stack.length);
    }
  
    return root;
  }


}
