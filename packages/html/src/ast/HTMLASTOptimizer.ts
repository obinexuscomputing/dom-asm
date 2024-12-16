import { HTMLAST, HTMLASTNode } from "../ast/HTMLAST";

export class HTMLASTOptimizer {
  public optimize(ast: HTMLAST): void {
    if (!ast.root) return;
    this.removeEmptyTextNodes(ast.root);
    this.mergeTextNodes(ast.root);
  }

  private removeEmptyTextNodes(node: HTMLASTNode): void {
    if (!node.children) return;

    // Filter out empty text nodes
    node.children = node.children.filter((child) => {
      if (child.type === "Text") {
        // Remove nodes that are null, undefined, empty, or whitespace-only
        return child.value != null && child.value.trim() !== "";
      }
      return true;
    });

    // Process children recursively
    node.children.forEach(child => {
      if (child.type === "Element") {
        this.removeEmptyTextNodes(child);
      }
    });
  }

  private mergeTextNodes(node: HTMLASTNode): void {
    if (!node.children) return;

    // Process child elements first (depth-first)
    node.children.forEach(child => {
      if (child.type === "Element") {
        this.mergeTextNodes(child);
      }
    });

    let i = 0;
    while (i < node.children.length - 1) {
      const current = node.children[i];
      const next = node.children[i + 1];

      if (current.type === "Text" && next.type === "Text") {
        // Only merge if at least one node has non-whitespace content
        if (current.value?.trim() || next.value?.trim()) {
          // Preserve the original text values including their whitespace
          const currentText = current.value || "";
          const nextText = next.value || "";
          
          // Concatenate while preserving internal whitespace
          current.value = currentText + nextText;
          
          // Remove the merged node
          node.children.splice(i + 1, 1);
        } else {
          // Both nodes are whitespace-only, remove the second one
          node.children.splice(i + 1, 1);
        }
      } else {
        i++;
      }
    }
  }
}