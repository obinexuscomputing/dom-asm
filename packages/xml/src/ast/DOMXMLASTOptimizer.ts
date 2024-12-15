import { DOMXMLASTNode, DOMXMLAST } from "./DOMXMLAST";

export class DOMXMLASTOptimizer {
  /**
   * Optimize the given AST by removing redundant nodes, merging text nodes, and recalculating metadata.
   */
  public optimize(ast: DOMXMLAST): DOMXMLAST {
    const optimizedRoot = this.optimizeNode(ast.root);
    const metadata = this.computeMetadata(optimizedRoot); // Use the optimized root
    return new DOMXMLAST(optimizedRoot, metadata);
  }
  
  private optimizeChildren(children: DOMXMLASTNode[]): DOMXMLASTNode[] {
    // First pass: Remove empty text nodes and optimize children recursively
    let optimized = children
      .filter((node) => {
        if (node.type === "Text") {
          // Keep non-empty text nodes
          return node.value?.trim() !== "";
        }
        if (node.type === "Element") {
          // Keep elements with attributes or valid children
          const hasNonEmptyChildren = (node.children || []).some((child) =>
            child.type === "Text"
              ? child.value?.trim() !== ""
              : child.type === "Element"
          );
          return hasNonEmptyChildren || Object.keys(node.attributes || {}).length > 0;
        }
        return true; // Keep other node types (e.g., Comment, Doctype)
      })
      .map((node) =>
        node.type === "Element" && node.children
          ? { ...node, children: this.optimizeChildren(node.children) }
          : node
      );
  
    // Second pass: Merge adjacent text nodes
    let i = 0;
    while (i < optimized.length - 1) {
      const current = optimized[i];
      const next = optimized[i + 1];
      if (current.type === "Text" && next.type === "Text") {
        current.value = (current.value || "") + (next.value || ""); // Merge text values
        optimized.splice(i + 1, 1); // Remove the merged node
      } else {
        i++;
      }
    }
  
    return optimized;
  }
  

  private optimizeNode(node: DOMXMLASTNode): DOMXMLASTNode {
    if (node.children) {
      node.children = this.optimizeChildren(node.children);
    }
    return node;
  }
  
  /**
   * Compute metadata for the optimized AST.
   */
  public computeMetadata(root: DOMXMLASTNode): DOMXMLAST["metadata"] {
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
