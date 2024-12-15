import { HTMLAST, HTMLASTNode } from "./HTMLAST";

export class HTMLASTOptimizer {
  public optimize(ast: HTMLAST): HTMLAST {
    this.removeEmptyNodes(ast.root);
    this.mergeTextNodes(ast.root);
    return ast;
  }

  private removeEmptyNodes(node: HTMLASTNode): void {
    if (!node.children) return;

    node.children = node.children.filter((child: HTMLASTNode) => {
      if (child.type === "Text" && (child.value?.trim() === "" || !child.value)) {
        return false; // Remove empty text nodes
      }
      this.removeEmptyNodes(child); // Recursively clean children
      return true; // Retain non-empty nodes
    });
  }

  private mergeTextNodes(node: HTMLASTNode): void {
    if (!node.children) return;

    let i = 0;
    while (i < node.children.length - 1) {
      const current = node.children[i];
      const next = node.children[i + 1];

      if (current.type === "Text" && next.type === "Text") {
        current.value = (current.value || "") + (next.value || ""); // Concatenate adjacent text nodes
        node.children.splice(i + 1, 1); // Remove the merged node
      } else {
        this.mergeTextNodes(current); // Recurse on non-text nodes
        i++;
      }
    }
  }
}
