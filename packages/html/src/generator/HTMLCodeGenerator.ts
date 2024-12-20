import { HTMLASTNode } from "../ast/HTMLAST";

export class HTMLCodeGenerator {
  private selfClosingTags: string[];

  constructor(selfClosingTags: string[] = ["img", "input", "br", "hr", "meta", "link"]) {
    this.selfClosingTags = selfClosingTags;
  }

  public generateHTML(node: HTMLASTNode): string {
    if (node.type === "Text") {
      return node.value || "";
    }

    if (node.type === "Comment") {
      return `<!-- ${node.value || ""} -->`;
    }

    if (node.type === "Element") {
      const attributes = this.generateAttributes(node.attributes || {});
      const children = node.children?.map((child: HTMLASTNode) => this.generateHTML(child)).join("") || "";

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
    return this.selfClosingTags.includes(tagName || "");
  }
}
