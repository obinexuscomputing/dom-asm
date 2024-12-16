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
        return child.value && child.value.trim() !== "";
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
        // Preserve spaces between merged text nodes
        const currentText = current.value || "";
        const nextText = next.value || "";
        
        // Handle space preservation
        let mergedText = currentText;
        if (currentText.endsWith(" ") || nextText.startsWith(" ")) {
          mergedText += nextText;
        } else {
          mergedText += " " + nextText;
        }
        
        current.value = mergedText.trim();
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