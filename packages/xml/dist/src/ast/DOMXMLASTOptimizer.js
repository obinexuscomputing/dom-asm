import { DOMXMLAST } from "./DOMXMLAST";
export class DOMXMLASTOptimizer {
    /**
     * Optimize the given AST by removing redundant nodes, merging text nodes, and recalculating metadata.
     */
    optimize(ast) {
        const optimizedRoot = this.optimizeNode(ast.root);
        const metadata = this.computeMetadata(optimizedRoot); // Use the optimized root
        return new DOMXMLAST(optimizedRoot, metadata);
    }
    optimizeChildren(children) {
        // First pass: Remove empty text nodes and optimize children recursively
        let optimized = children
            .filter((node) => {
            if (node.type === "Text") {
                // Keep non-empty text nodes
                return node.value?.trim() !== "";
            }
            if (node.type === "Element") {
                // Always keep elements; further optimization happens recursively
                return true;
            }
            return true; // Keep other node types (e.g., Comment, Doctype)
        })
            .map((node) => node.type === "Element" && node.children
            ? { ...node, children: this.optimizeChildren(node.children) }
            : node);
        // Second pass: Merge adjacent text nodes
        let i = 0;
        while (i < optimized.length - 1) {
            const current = optimized[i];
            const next = optimized[i + 1];
            if (current.type === "Text" && next.type === "Text") {
                current.value = (current.value || "") + (next.value || ""); // Merge text values
                optimized.splice(i + 1, 1); // Remove the merged node
            }
            else {
                i++;
            }
        }
        return optimized;
    }
    optimizeNode(node) {
        if (node.children) {
            node.children = this.optimizeChildren(node.children);
        }
        return node;
    }
    /**
     * Compute metadata for the optimized AST.
     */
    computeMetadata(root) {
        let nodeCount = 0;
        let elementCount = 0;
        let textCount = 0;
        let commentCount = 0;
        const traverse = (node) => {
            nodeCount++;
            switch (node.type) {
                case "Element":
                    elementCount++;
                    break;
                case "Text":
                    textCount++;
                    break;
                case "Comment":
                    commentCount++;
                    break;
            }
            if (node.children) {
                node.children.forEach(traverse);
            }
        };
        traverse(root);
        return { nodeCount, elementCount, textCount, commentCount };
    }
}
//# sourceMappingURL=DOMXMLASTOptimizer.js.map