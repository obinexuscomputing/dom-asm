export interface DOMXMLMetadata {
  nodeCount: number;
  elementCount: number;
  textCount: number;
  commentCount: number;
}

export interface DOMXMLASTNode {
  type: "Element" | "Text" | "Comment" | "Doctype";
  name?: string;
  value?: string;
  attributes?: Record<string, string>;
  children?: DOMXMLASTNode[];
}

export class DOMXMLAST {
  constructor(
    public root: DOMXMLASTNode,
    public metadata: DOMXMLMetadata
  ) {}

  computeMetadata(): DOMXMLMetadata {
    let nodeCount = 0;
    let elementCount = 0;
    let textCount = 0;
    let commentCount = 0;

    const traverse = (node: DOMXMLASTNode) => {
      nodeCount++;
      switch (node.type) {
        case "Element":
          elementCount++;
          break;
        case "Text":
          textCount++;
          break;
        case "Comment":
          commentCount++;
          break;
      }
      node.children?.forEach(traverse);
    };

    traverse(this.root);

    return {
      nodeCount,
      elementCount,
      textCount,
      commentCount,
    };
  }
  addChildNode(parent: DOMXMLASTNode, child: DOMXMLASTNode): void {
    parent.children = parent.children || [];
    parent.children.push(child);
  }

  removeChildNode(parent: DOMXMLASTNode, child: DOMXMLASTNode): void {
    parent.children = parent.children?.filter((c) => c !== child) || [];
  }
}
