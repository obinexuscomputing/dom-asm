import { HTMLAST, HTMLASTNode } from "../ast/HTMLAST";

export class HTMLASTOptimizer {
  public optimize(ast: HTMLAST): void {
    if (!ast.root) return;
    this.removeEmptyTextNodes(ast.root);
    this.mergeTextNodes(ast.root);
  }

  private removeEmptyTextNodes(node: HTMLASTNode): void {
    if (!node.children) return;

    // Filter out empty text nodes, but preserve significant whitespace
    node.children = node.children.filter((child) => {
      if (child.type === "Text") {
        return child.value != null && (child.value.trim() !== "" || this.isSignificantWhitespace(child, node.children));
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

  private isSignificantWhitespace(node: HTMLASTNode, siblings: HTMLASTNode[]): boolean {
    if (node.type !== "Text" || !node.value) return false;
    const index = siblings.indexOf(node);
    
    // Check if this whitespace is between elements or before/after element
    const prev = index > 0 ? siblings[index - 1] : null;
    const next = index < siblings.length - 1 ? siblings[index + 1] : null;
    
    return (prev?.type === "Element" || next?.type === "Element");
  }

  private mergeTextNodes(node: HTMLASTNode): void {
    if (!node.children) return;

    // Process child elements first (depth-first)
    node.children.forEach(child => {
      if (child.type === "Element") {
        this.mergeTextNodes(child);
      }
    });

    for (let i = 0; i < node.children.length - 1; i++) {
      const current = node.children[i];
      const next = node.children[i + 1];

      if (current.type === "Text" && next.type === "Text") {
        const currentText = current.value || "";
        const nextText = next.value || "";
        
        // Special handling for trailing spaces
        if (!nextText.trim()) {
          // If next node is pure whitespace, preserve it exactly
          current.value = currentText + nextText;
        } else if (!currentText.trim()) {
          // If current node is pure whitespace, preserve it exactly
          current.value = currentText + nextText;
        } else {
          // Both nodes have content
          const needsSpace = !currentText.endsWith(" ") && !nextText.startsWith(" ");
          current.value = currentText + (needsSpace ? " " : "") + nextText;
        }
        
        // Remove the merged node
        node.children.splice(i + 1, 1);
        i--; // Recheck current position as we removed an element
      }
    }
  }

  private shouldPreserveWhitespace(text: string, isLast: boolean): boolean {
    // Preserve trailing spaces in specific cases
    return text.endsWith(" ") && isLast;
  }
}