"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ASTOptimizer = void 0;
class ASTOptimizer {
    optimize(node) {
        this.removeEmptyNodes(node);
        this.mergeTextNodes(node);
        return node;
    }
    removeEmptyNodes(node) {
        node.children = node.children.filter((child) => {
            var _a;
            if (child.type === "Text" && ((_a = child.value) === null || _a === void 0 ? void 0 : _a.trim()) === "") {
                return false; // Remove empty text nodes
            }
            if (child.type === "Element" && child.children.length === 0 && !this.isSelfClosingTag(child.name)) {
                return false; // Remove empty non-self-closing nodes
            }
            this.removeEmptyNodes(child); // Recursively optimize children
            return true;
        });
    }
    mergeTextNodes(node) {
        let i = 0;
        while (i < node.children.length - 1) {
            const current = node.children[i];
            const next = node.children[i + 1];
            if (current.type === "Text" && next.type === "Text") {
                // Merge adjacent text nodes
                current.value = (current.value || "") + (next.value || "");
                node.children.splice(i + 1, 1); // Remove the merged node
            }
            else {
                this.mergeTextNodes(current); // Recursively optimize children
                i++;
            }
        }
    }
    isSelfClosingTag(tagName) {
        const selfClosingTags = ["img", "input", "br", "hr", "meta", "link"];
        return selfClosingTags.includes(tagName || "");
    }
}
exports.ASTOptimizer = ASTOptimizer;
