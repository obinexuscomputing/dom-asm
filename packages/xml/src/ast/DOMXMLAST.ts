import { DOMXMLASTNode } from ".";

export class DOMXMLAST {
  root: DOMXMLASTNode;
  metadata?: {
    nodeCount: number;
    elementCount: number;
    textCount: number;
    commentCount: number;
    optimizationMetrics?: {
      originalStateCount: number;
      minimizedStateCount: number;
      reductionPercentage: number;
    };
  };

  constructor(root: DOMXMLASTNode) {
    this.root = root;
    this.metadata = this.computeMetadata();
  }

  /**
   * Compute metadata for the AST, including node counts and element types.
   */
  private computeMetadata(): DOMXMLAST['metadata'] {
    let nodeCount = 0;
    let elementCount = 0;
    let textCount = 0;
    let commentCount = 0;

    const traverse = (node: DOMXMLASTNode, isRoot = false): void => {
      if (!isRoot) {
        nodeCount++;
        switch (node.type) {
          case 'Element':
            elementCount++;
            break;
          case 'Text':
            textCount++;
            break;
          case 'Comment':
            commentCount++;
            break;
        }
      }

      if (node.children) {
        node.children.forEach((child: unknown) => traverse(child));
      }
    };

    traverse(this.root, true);

    return {
      nodeCount,
      elementCount,
      textCount,
      commentCount,
    };
  }

  /**
   * Add a new child node to a specific parent node by reference.
   */
  addChildNode(parent: DOMXMLASTNode, child: DOMXMLASTNode): void {
    parent.children = parent.children || [];
    parent.children.push(child);
    this.metadata = this.computeMetadata(); // Update metadata
  }

  /**
   * Remove a child node from a specific parent node by reference.
   */
  removeChildNode(parent: DOMXMLASTNode, child: DOMXMLASTNode): void {
    if (!parent.children) return;
    parent.children = parent.children.filter((c: any) => c !== child);
    this.metadata = this.computeMetadata(); // Update metadata
  }
}