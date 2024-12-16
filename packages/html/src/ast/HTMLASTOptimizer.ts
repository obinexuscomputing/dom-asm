import { HTMLAST, HTMLASTNode } from "../ast/HTMLAST";

export class HTMLASTOptimizer {
  public optimize(ast: HTMLAST): void {
    if (!ast.root) return;
    this.removeEmptyTextNodes(ast.root);
    this.mergeTextNodes(ast.root);
  }

  private removeEmptyTextNodes(node: HTMLASTNode): void {
    if (!node.children) return;

    node.children = node.children.filter((child) => {
      if (child.type === "Text") {
        return child.value && child.value.trim() !== "";
      }
      return true;
    });

    node.children.forEach(child => {
      if (child.type === "Element") {
        this.removeEmptyTextNodes(child);
      }
    });
  }

  private mergeTextNodes(node: HTMLASTNode): void {
    if (!node.children) return;

    // First merge text nodes in all child elements
    node.children.forEach(child => {
      if (child.type === "Element") {
        this.mergeTextNodes(child);
      }
    });

    // Then merge adjacent text nodes at this level
    let i = 0;
    while (i < node.children.length - 1) {
      const current = node.children[i];
      const next = node.children[i + 1];

      if (current.type === "Text" && next.type === "Text") {
        // Combine text nodes while preserving intentional spaces
        const combinedText = [current.value || "", next.value || ""]
          .map(text => text.trim())
          .join(" ")
          .trim();

        current.value = combinedText;
        node.children.splice(i + 1, 1);
      } else {
        i++;
      }
    }
  }
}