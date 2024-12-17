import { DOMXMLAST, DOMXMLASTNode } from "../ast/DOMXMLAST";

export interface GeneratorOptions {
  indent?: string;
  newLine?: string;
  xmlDeclaration?: boolean;
  prettyPrint?: boolean;
}

export class DOMXMLGenerator {
  private options: Required<GeneratorOptions>;

  constructor(options: GeneratorOptions = {}) {
    this.options = {
      indent: options.indent ?? "  ",
      newLine: options.newLine ?? "\n",
      xmlDeclaration: options.xmlDeclaration ?? true,
      prettyPrint: options.prettyPrint ?? true,
    };
  }

  public generate(ast: DOMXMLAST): string {
    let result = "";

    if (this.options.xmlDeclaration) {
      result += '<?xml version="1.0" encoding="UTF-8"?>' + this.options.newLine;
    }

    result += this.generateNode(ast.root, 0);
    return result;
  }

  private generateNode(node: DOMXMLASTNode, depth: number): string {
    switch (node.type) {
      case "Element":
        return this.generateElement(node, depth);
      case "Text":
        return this.generateText(node, depth);
      case "Comment":
        return this.generateComment(node, depth);
      case "Doctype":
        return this.generateDoctype(node, depth);
      default:
        throw new Error(`Unknown node type: ${node.type}`);
    }
  }

  private generateElement(node: DOMXMLASTNode, depth: number): string {
    const indent = this.options.prettyPrint ? this.getIndent(depth) : "";
    let result = indent + "<" + (node.name || "");

    if (node.attributes) {
      result += Object.entries(node.attributes)
        .map(
          ([key, value]) => ` ${key}="${this.escapeAttribute(String(value))}"`,
        )
        .join("");
    }

    if (!node.children?.length) {
      return result + "/>" + this.options.newLine;
    }

    result += ">";

    if (node.children.length === 1 && node.children[0].type === "Text") {
      result += this.escapeText(node.children[0].value || "");
      result += "</" + node.name + ">" + this.options.newLine;
      return result;
    }

    result += this.options.newLine;

    for (const child of node.children) {
      result += this.generateNode(child, depth + 1);
    }

    result += indent + "</" + node.name + ">" + this.options.newLine;
    return result;
  }

  private generateText(node: DOMXMLASTNode, depth: number): string {
    const indent = this.options.prettyPrint ? this.getIndent(depth) : "";
    return indent + this.escapeText(node.value || "") + this.options.newLine;
  }

  private generateComment(node: DOMXMLASTNode, depth: number): string {
    const indent = this.options.prettyPrint ? this.getIndent(depth) : "";
    return indent + "<!--" + (node.value || "") + "-->" + this.options.newLine;
  }

  private generateDoctype(node: DOMXMLASTNode, depth: number): string {
    const indent = this.options.prettyPrint ? this.getIndent(depth) : "";
    return (
      indent + "<!DOCTYPE " + (node.value || "") + ">" + this.options.newLine
    );
  }

  private getIndent(depth: number): string {
    return this.options.indent.repeat(depth);
  }

  private escapeText(text: string): string {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  private escapeAttribute(text: string): string {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }
}
