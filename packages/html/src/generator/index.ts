import { ASTNode } from "../ast/index";

class HTMLCodeGenerator {
  public generateHTML(node: ASTNode): string {
    if (node.type === "Text") {
      return node.value || "";
    }

    if (node.type === "Comment") {
      return `<!-- ${node.value} -->`;
    }

    if (node.type === "Element") {
      const attributes = this.generateAttributes(node.attributes || {});
      const children = node.children.map((child) => this.generateHTML(child)).join("");

      if (this.isSelfClosingTag(node.name)) {
        return `<${node.name}${attributes} />`;
      }

      return `<${node.name}${attributes}>${children}</${node.name}>`;
    }

    return "";
  }

  private generateAttributes(attributes: Record<string, string>): string {
    return Object.entries(attributes)
      .map(([key, value]) => ` ${key}="${value}"`)
      .join("");
  }

  private isSelfClosingTag(tagName?: string): boolean {
    const selfClosingTags = ["img", "input", "br", "hr", "meta", "link"];
    return selfClosingTags.includes(tagName || "");
  }
}

export { HTMLCodeGenerator };
