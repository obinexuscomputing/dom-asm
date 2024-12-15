import { HTMLASTNode } from "../ast";
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


export interface HTMLElementNode {
  type: "Element";
  name: string;
  attributes: Record<string, string>;
  children: HTMLASTNode[];
}

export interface HTMLTextNode {
  type: "Text";
  value: string;
}

export interface HTMLCommentNode {
  type: "Comment";
  value: string;
}

export class HTMLParser {
  private tokenizer: HTMLTokenizer;

  constructor() {
    this.tokenizer = new HTMLTokenizer("");
  }

  public parse(input: string): HTMLASTNode {
    this.tokenizer = new HTMLTokenizer(input);
    const tokens = this.tokenizer.tokenize();
    return this.buildAST(tokens);
  }

  private buildAST(tokens: HTMLToken[]): HTMLASTNode {
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
      throw new Error("Unclosed tags detected");
    }

    return root;
  }
}