import { HTMLToken } from "../tokenizer";

export interface HTMLASTNode {
  type: "Element" | "Text" | "Comment" | "Doctype";
  name?: string; // For "Element" nodes
  value?: string; // For "Text", "Comment", or "Doctype" nodes
  attributes?: Record<string, string>; // For "Element" nodes
  children?: HTMLASTNode[]; // For "Element" nodes
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

export class HTMLASTBuilder {
  private tokens: HTMLToken[];
  private position: number;

  constructor(tokens: HTMLToken[]) {
    this.tokens = tokens;
    this.position = 0;
  }

  public buildAST(): HTMLAST {
    const root: HTMLASTNode = { type: "Element", name: "root", children: [] };
    const stack: HTMLASTNode[] = [root];
    let currentParent = root;
  
    while (this.position < this.tokens.length) {
      const token = this.tokens[this.position++];
  
      switch (token.type) {
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
          if (stack.length > 1 && currentParent.name === token.name) {
            stack.pop();
            currentParent = stack[stack.length - 1];
          } else if (process.env.NODE_ENV !== "test") {
            console.warn(`Unmatched end tag: ${token.name}`);
          }
          break;
  
        case "Text":
        case "Comment":
          currentParent.children?.push({
            type: token.type,
            value: token.value,
          });
          break;
  
        default:
          if (process.env.NODE_ENV !== "test") {
            console.warn(`Unexpected token type: ${token.type}`);
          }
      }
    }
  
    if (stack.length > 1 && process.env.NODE_ENV !== "test") {
      console.warn(
        `Unclosed tags detected: ${stack.slice(1).map((node) => node.name)}`
      );
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
      node.children?.forEach(traverse);
    }

    traverse(root);
    return { nodeCount, elementCount, textCount, commentCount };
  }
}
