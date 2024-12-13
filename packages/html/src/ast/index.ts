import { Token } from "../tokenizer/index";

// Define the types for AST nodes
type ASTNodeType = "Element" | "Text" | "Comment";

interface ASTNode {
  type: ASTNodeType;
  name?: string; // For Element nodes
  value?: string; // For Text or Comment nodes
  attributes?: Record<string, string>; // For Element nodes
  children: ASTNode[];
  parent: ASTNode | null; // Reference to parent node
}

class AST {
  private root: ASTNode;

  constructor() {
    this.root = { type: "Element", name: "root", children: [], parent: null };
  }

  public buildAST(tokens: Token[]): ASTNode {
    const stack: ASTNode[] = [this.root];
    let currentParent = this.root;
  
    for (const token of tokens) {
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
            currentParent = stack[stack.length - 1];
          } else {
            throw new Error(
              `Unmatched end tag: </${token.name}>. Expected </${currentParent.name}>.`
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
          // This should never happen. Use a `never` check to catch unhandled cases.
          const exhaustiveCheck: never = token;
          throw new Error(`Unsupported token type: ${exhaustiveCheck}`);
      }
    }
  
    return this.root;
  }
  
  public getRoot(): ASTNode {
    return this.root;
  }

  public printAST(node: ASTNode = this.root, depth: number = 0): void {
    const indent = "  ".repeat(depth);
    if (node.type === "Element") {
      console.log(`${indent}<${node.name}>`);
      node.children.forEach((child) => this.printAST(child, depth + 1));
      console.log(`${indent}</${node.name}>`);
    } else if (node.type === "Text") {
      console.log(`${indent}${node.value}`);
    } else if (node.type === "Comment") {
      console.log(`${indent}<!-- ${node.value} -->`);
    }
  }
}

export { AST, ASTNode };
