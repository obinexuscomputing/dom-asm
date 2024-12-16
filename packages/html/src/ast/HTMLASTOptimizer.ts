import { HTMLAST, HTMLASTNode } from "./HTMLAST";

export class HTMLASTOptimizer {
  public optimize(ast: HTMLAST): void {
    this.removeEmptyTextNodes(ast.root);
    this.mergeTextNodes(ast.root);
  }
  
  

// Merge adjacent text nodes while preserving spaces
public mergeTextNodes(node: HTMLASTNode): void {
  if (!node.children) return;

  let i = 0;
  while (i < node.children.length - 1) {
    const current = node.children[i];
    const next = node.children[i + 1];

    if (current.type === "Text" && next.type === "Text") {
      // Preserve spaces between text nodes
      current.value = (current.value || "").trimEnd() + " " + (next.value || "").trimStart();
      node.children.splice(i + 1, 1); // Remove merged node
    } else {
      this.mergeTextNodes(current); // Recursively optimize child nodes
      i++;
    }
  }
}

// Remove empty or whitespace-only text nodes
private removeEmptyTextNodes(node: HTMLASTNode): void {
  if (node.children) {
    node.children = node.children.filter(
      (child) => !(child.type === "Text" && (!child.value || child.value.trim() === ""))
    );
    node.children.forEach((child) => this.removeEmptyTextNodes(child));
  }
}

  
}
