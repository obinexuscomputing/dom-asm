import { DOMXMLASTNode, DOMXMLAST } from "./DOMXMLAST";

export class DOMXMLASTOptimizer {
  /**
   * Optimize the given AST by removing redundant nodes, merging text nodes, and recalculating metadata.
   */
  public optimize(ast: DOMXMLAST): DOMXMLAST {
    const optimizedRoot = this.optimizeNode(ast.root);
    return new DOMXMLAST(optimizedRoot, ast.computeMetadata());
  }
  /**
   * Optimize children nodes by removing empty nodes and merging adjacent text nodes.
   */
  private optimizeChildren(children: DOMXMLASTNode[]): DOMXMLASTNode[] {
    let optimized = children
      .filter((node) => {
        if (node.type === "Text") {
          return node.value?.trim() !== "";
        }
        if (node.type === "Element") {
          const hasNonEmptyChildren = (node.children || []).some((child: DOMXMLASTNode) =>
            child.type === "Text"
              ? child.value?.trim() !== ""
              : child.type === "Element"
          );
          return hasNonEmptyChildren || Object.keys(node.attributes || {}).length > 0;
        }
        return true;
      })
      .map((node) =>
        node.type === "Element" && node.children
          ? { ...node, children: this.optimizeChildren(node.children) }
          : node
      );

    // Merge adjacent text nodes
    let i = 0;
    while (i < optimized.length - 1) {
      const current = optimized[i];
      const next = optimized[i + 1];
      if (current.type === "Text" && next.type === "Text") {
        current.value = (current.value || "") + (next.value || "");
        optimized.splice(i + 1, 1); // Remove the merged node
      } else {
        i++;
      }
    }

    return optimized;
  }

  private optimizeNode(node: DOMXMLASTNode): DOMXMLASTNode {
    if (node.children) {
      node.children = node.children
        .filter((child) =>
          child.type === "Text"
            ? child.value?.trim() !== ""
            : child.type !== "Doctype" || Object.keys(child.attributes || {}).length > 0
        )
        .map((child) => this.optimizeNode(child));
    }
    return node;
  }
  /**
   * Compute metadata for the optimized AST.
   */
  private computeMetadata(root: DOMXMLASTNode): DOMXMLAST["metadata"] {
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
      if (node.children) {
        node.children.forEach(traverse);
      }
    };

    traverse(root);

    return { nodeCount, elementCount, textCount, commentCount };
  }
}
