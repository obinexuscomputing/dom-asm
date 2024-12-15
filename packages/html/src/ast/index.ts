import { HTMLElementNode, HTMLTextNode, HTMLCommentNode } from "../parser";

export type HTMLASTNode = HTMLElementNode | HTMLTextNode | HTMLCommentNode;

export class HTMLASTOptimizer {
  public optimize(node: HTMLASTNode): HTMLASTNode {
    this.removeEmptyNodes(node);
    this.mergeTextNodes(node);
    return node;
  }

  private removeEmptyNodes(node: HTMLASTNode): void {
    if ("children" in node) {
      node.children = node.children.filter((child) => {
        if (child.type === "Text" && child.value.trim() === "") {
          return false;
        }
        if (child.type === "Element" && child.children.length === 0) {
          return false;
        }
        this.removeEmptyNodes(child);
        return true;
      });
    }
  }

  private mergeTextNodes(node: HTMLASTNode): void {
    if ("children" in node) {
      let i = 0;
      while (i < node.children.length - 1) {
        const current = node.children[i];
        const next = node.children[i + 1];

        if (current.type === "Text" && next.type === "Text") {
          current.value += next.value;
          node.children.splice(i + 1, 1);
        } else {
          this.mergeTextNodes(current);
          i++;
        }
      }
    }
  }
}
