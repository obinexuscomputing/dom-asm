import { HTMLParserError } from "../parser";
import { HTMLToken } from "../tokenizer";

export interface HTMLAST {
  root: HTMLASTNode; // Root node of the AST
  metadata?: {
    nodeCount: number; // Total number of nodes in the AST
    elementCount: number; // Count of "Element" nodes
    textCount: number; // Count of "Text" nodes
    commentCount: number; // Count of "Comment" nodes
  };
}

export interface HTMLAST {
  root: HTMLASTNode; // Root node of the AST
  metadata?: {
    nodeCount: number; // Total number of nodes in the AST
    elementCount: number; // Count of "Element" nodes
    textCount: number; // Count of "Text" nodes
    commentCount: number; // Count of "Comment" nodes
  };
}

export class HTMLASTNode {
  type: "Element" | "Text" | "Comment" | "Doctype";
  name?: string;
  value?: string;
  attributes?: Record<string, string>;
  children: HTMLASTNode[];

  constructor(
    type: "Element" | "Text" | "Comment" | "Doctype",
    children: HTMLASTNode[] = [],
    options: { name?: string; value?: string; attributes?: Record<string, string> } = {}
  ) {
    this.type = type;
    this.children = children;
    this.name = options.name;
    this.value = options.value;
    this.attributes = options.attributes || {};
  }
}


export class HTMLASTBuilder {
  private tokens: HTMLToken[];

  constructor(tokens: HTMLToken[]) {
    this.tokens = tokens;
  }

  public buildAST(): HTMLAST {
    const root = new HTMLASTNode("Element", [], { name: "root" });
    const stack: HTMLASTNode[] = [root];
    let currentParent = root;

    for (const token of this.tokens) {
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
      const lastToken = this.tokens[this.tokens.length - 1] || { name: "unknown", line: -1, column: -1 };
      throw new HTMLParserError("Unclosed tags detected", lastToken, stack.length);
    }

    return {
      root,
      metadata: this.computeMetadata(root),
    };
  }

  private computeMetadata(root: HTMLASTNode): HTMLAST["metadata"] {
    let nodeCount = 0;
    let elementCount = 0;
    let textCount = 0;
    let commentCount = 0;

    function traverse(node: HTMLASTNode): void {
      nodeCount++;
      if (node.type === "Element") elementCount++;
      if (node.type === "Text") textCount++;
      if (node.type === "Comment") commentCount++;
      node.children.forEach(traverse);
    }

    traverse(root);
    return { nodeCount, elementCount, textCount, commentCount };
  }
}
