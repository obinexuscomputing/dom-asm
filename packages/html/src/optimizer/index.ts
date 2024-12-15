import { HTMLAST, HTMLASTNode } from "../ast/HTMLAST";

export class HTMLASTOptimizer {
  public optimize(ast: HTMLAST): HTMLAST {
    this.removeEmptyNodes(ast.root);
    this.mergeTextNodes(ast.root);
    return ast;
  }

  private removeEmptyNodes(node: HTMLASTNode): void {
    if (node.children) {
      node.children = node.children.filter((child: HTMLASTNode) => {
        if (child.type === "Text" && (child.value?.trim() === "" || !child.value)) {
          return false;
        }
        this.removeEmptyNodes(child);
        return true;
      });
    }
  }

  private mergeTextNodes(node: HTMLASTNode): void {
    if (node.children) {
      let i = 0;
      while (i < node.children.length - 1) {
        const current = node.children[i];
        const next = node.children[i + 1];

        if (current.type === "Text" && next.type === "Text") {
          current.value = (current.value || "") + (next.value || ""); // Handle undefined values
          node.children.splice(i + 1, 1);
        } else {
          this.mergeTextNodes(current);
          i++;
        }
      }
    }
  }
}
