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
    const root: HTMLElementNode = { type: "Element", name: "root", attributes: {}, children: [] };
    const stack: HTMLElementNode[] = [root];

    for (const token of tokens) {
      switch (token.type) {
        case "StartTag": {
          const elementNode: HTMLElementNode = {
            type: "Element",
            name: token.name ?? "", // Default to an empty string
            attributes: token.attributes ?? {}, // Default to an empty object
            children: [],
          };
          stack[stack.length - 1].children.push(elementNode);
          stack.push(elementNode);
          break;
        }
        
        case "Text": {
          const textNode: HTMLTextNode = {
            type: "Text",
            value: token.value ?? "", // Default to an empty string
          };
          stack[stack.length - 1].children.push(textNode);
          break;
        }
        
        case "Comment": {
          const commentNode: HTMLCommentNode = {
            type: "Comment",
            value: token.value ?? "", // Default to an empty string
          };
          stack[stack.length - 1].children.push(commentNode);
          break;
        }
      }        

    }

    if (stack.length > 1) {
      throw new HTMLParserError("Unclosed tags detected", tokens[tokens.length - 1], tokens.length);
    }

    return root;
  }
}
