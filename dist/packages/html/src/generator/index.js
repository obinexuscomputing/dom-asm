class CodeGenerator {
    generateHTML(node) {
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
    generateAttributes(attributes) {
        return Object.entries(attributes)
            .map(([key, value]) => ` ${key}="${value}"`)
            .join("");
    }
    isSelfClosingTag(tagName) {
        const selfClosingTags = ["img", "input", "br", "hr", "meta", "link"];
        return selfClosingTags.includes(tagName || "");
    }
}
export { CodeGenerator };
//# sourceMappingURL=index.js.map