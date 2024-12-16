import { HTMLAST, HTMLASTNode } from "./HTMLAST";

export class HTMLASTOptimizer {
  public optimize(ast: HTMLAST): void {
    this.removeEmptyTextNodes(ast.root);
    this.mergeAdjacentTextNodes(ast.root);
  }
  public mergeAdjacentTextNodes(node: HTMLASTNode): void {
    if (node.children) {
      const mergedChildren = [];
      let lastTextNode: HTMLASTNode | null = null;
  
      for (const child of node.children) {
        if (child.type === "Text") {
          if (lastTextNode) {
            lastTextNode.value = (lastTextNode.value || "") + (child.value || "");
          } else {
            lastTextNode = { ...child };
            mergedChildren.push(lastTextNode);
          }
        } else {
          lastTextNode = null;
          this.mergeAdjacentTextNodes(child);
          mergedChildren.push(child);
        }
      }
  
      node.children = mergedChildren;
    }
  }
  

  private removeEmptyTextNodes(node: HTMLASTNode): void {
    if (node.children) {
      node.children = node.children.filter(
        (child) => !(child.type === "Text" && (!child.value || child.value.trim() === ""))
      );
      node.children.forEach((child) => this.removeEmptyTextNodes(child));
    }
  }

  public mergeTextNodes(node: HTMLASTNode): void {
    if (!node.children) return;
  
    let i = 0;
    while (i < node.children.length - 1) {
      const current = node.children[i];
      const next = node.children[i + 1];
  
      if (current.type === "Text" && next.type === "Text") {
        current.value = (current.value || "").trimEnd() + " " + (next.value || "").trimStart();
        node.children.splice(i + 1, 1);
      } else {
        this.mergeTextNodes(current); // Recursively optimize child nodes
        i++;
      }
    }
  }
  
}
