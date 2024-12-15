import { DOMXMLToken } from "../tokenizer/DOMXMLTokenizer";
import { DOMXMLAST, DOMXMLASTNode } from "../ast/DOMXMLAST";

export class DOMXMLParser {
  private tokens: DOMXMLToken[];
  private position: number;

  constructor(tokens: DOMXMLToken[]) {
    this.tokens = tokens;
    this.position = 0;
  }

  public parse(): DOMXMLAST {
    const root: DOMXMLASTNode = { type: "Element", name: "root", children: [] };
    const stack: DOMXMLASTNode[] = [root];
    let currentParent = root;

    while (this.position < this.tokens.length) {
      const token = this.tokens[this.position++];

      switch (token.type) {
        case "StartTag":
          const elementNode: DOMXMLASTNode = {
            type: "Element",
            name: token.name,
            attributes: token.attributes,
            children: [],
          };
          currentParent.children?.push(elementNode);
          if (!token.selfClosing) {
            stack.push(elementNode);
            currentParent = elementNode;
          }
          break;

        case "EndTag":
          if (stack.length > 1) {
            stack.pop();
            currentParent = stack[stack.length - 1];
          }
          break;

        case "Text":
        case "Comment":
        case "Doctype":
          currentParent.children?.push({
            type: token.type,
            value: token.value,
          });
          break;
      }
    }

    return {
      root,
      metadata: this.computeMetadata(root),
    };
  }

  private computeMetadata(root: DOMXMLASTNode): DOMXMLAST["metadata"] {
    let nodeCount = 0;
    let elementCount = 0;
    let textCount = 0;
    let commentCount = 0;

    function traverse(node: DOMXMLASTNode): void {
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
