import { HTMLAST, HTMLASTNode } from "../ast/HTMLAST";

export class HTMLASTOptimizer {
  public optimize(ast: HTMLAST): void {
    if (!ast.root) return;
    this.removeEmptyTextNodes(ast.root);
    this.mergeTextNodes(ast.root);
  }

  private removeEmptyTextNodes(node: HTMLASTNode): void {
    if (!node.children) return;

    // Filter out completely empty text nodes but preserve pure whitespace nodes
    node.children = node.children.filter((child) => {
      if (child.type === "Text") {
        return child.value !== undefined && child.value !== null;
      }
      return true;
    });

    // Recursively process remaining children
    node.children.forEach(child => {
      if (child.type === "Element") {
        this.removeEmptyTextNodes(child);
      }
    });
  }

  private mergeTextNodes(node: HTMLASTNode): void {
    if (!node.children) return;

    let i = 0;
    while (i < node.children.length - 1) {
      const current = node.children[i];
      const next = node.children[i + 1];

      if (current.type === "Text" && next.type === "Text") {
        const currentText = current.value || "";
        const nextText = next.value || "";
        
        // Preserve all spaces, including trailing ones
        current.value = currentText + nextText;
        
        // Remove the merged node
        node.children.splice(i + 1, 1);
      } else {
        if (current.type === "Element") {
          this.mergeTextNodes(current);
        }
        i++;
      }
    }

    // Process the last child if it's an element
    const lastChild = node.children[node.children.length - 1];
    if (lastChild && lastChild.type === "Element") {
      this.mergeTextNodes(lastChild);
    }
  }
}