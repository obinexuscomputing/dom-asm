import { HTMLAST, HTMLASTNode } from "../ast/HTMLAST";

export class HTMLASTOptimizer {
  public optimize(ast: HTMLAST): void {
    if (!ast.root) return;
    this.removeEmptyTextNodes(ast.root);
    this.mergeTextNodes(ast.root);
  }

  private removeEmptyTextNodes(node: HTMLASTNode): void {
    if (!node.children) return;

    // Filter out only completely empty text nodes
    node.children = node.children.filter((child) => {
      if (child.type === "Text") {
        // Keep nodes that have content, even if it's just whitespace
        return child.value != null;
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

    // Process child elements first
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
        // Preserve the original text values including their whitespace
        const currentText = current.value || "";
        const nextText = next.value || "";
        
        // Simply concatenate the text values to preserve all spaces
        current.value = currentText + nextText;
        
        // Remove the merged node
        node.children.splice(i + 1, 1);
      } else {
        i++;
      }
    }

    // Final pass to ensure no null values
    node.children = node.children.map(child => {
      if (child.type === "Text" && child.value != null) {
        return {
          ...child,
          value: child.value
        };
      }
      return child;
    });
  }
}