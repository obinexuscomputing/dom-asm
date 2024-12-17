export class DOMXMLGenerator {
    constructor(options = {}) {
        this.options = {
            indent: options.indent ?? "  ",
            newLine: options.newLine ?? "\n",
            xmlDeclaration: options.xmlDeclaration ?? true,
            prettyPrint: options.prettyPrint ?? true,
        };
    }
    generate(ast) {
        let result = "";
        if (this.options.xmlDeclaration) {
            result += '<?xml version="1.0" encoding="UTF-8"?>' + this.options.newLine;
        }
        result += this.generateNode(ast.root, 0);
        return result;
    }
    generateNode(node, depth) {
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
    generateElement(node, depth) {
        const indent = this.options.prettyPrint ? this.getIndent(depth) : "";
        let result = indent + "<" + (node.name || "");
        if (node.attributes) {
            result += Object.entries(node.attributes)
                .map(([key, value]) => ` ${key}="${this.escapeAttribute(String(value))}"`)
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
    generateText(node, depth) {
        const indent = this.options.prettyPrint ? this.getIndent(depth) : "";
        return indent + this.escapeText(node.value || "") + this.options.newLine;
    }
    generateComment(node, depth) {
        const indent = this.options.prettyPrint ? this.getIndent(depth) : "";
        return indent + "<!--" + (node.value || "") + "-->" + this.options.newLine;
    }
    generateDoctype(node, depth) {
        const indent = this.options.prettyPrint ? this.getIndent(depth) : "";
        return (indent + "<!DOCTYPE " + (node.value || "") + ">" + this.options.newLine);
    }
    getIndent(depth) {
        return this.options.indent.repeat(depth);
    }
    escapeText(text) {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    }
    escapeAttribute(text) {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&apos;");
    }
}
//# sourceMappingURL=DOMXMLGenerator.js.map