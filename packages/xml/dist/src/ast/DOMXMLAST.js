export class DOMXMLAST {
    constructor(root, metadata) {
        this.root = root;
        this.metadata = metadata;
    }
    computeMetadata() {
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
            node.children?.forEach(traverse);
        };
        traverse(this.root);
        return {
            nodeCount,
            elementCount,
            textCount,
            commentCount,
        };
    }
    addChildNode(parent, child) {
        parent.children = parent.children || [];
        parent.children.push(child);
    }
    removeChildNode(parent, child) {
        parent.children = parent.children?.filter((c) => c !== child) || [];
    }
}
//# sourceMappingURL=DOMXMLAST.js.map