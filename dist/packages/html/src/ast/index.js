class AST {
    root;
    constructor() {
        this.root = { type: "Element", name: "root", children: [], parent: null };
    }
    buildAST(tokens) {
        const stack = [this.root];
        let currentParent = this.root;
        for (const token of tokens) {
            switch (token.type) {
                case "StartTag":
                    const elementNode = {
                        type: "Element",
                        name: token.name,
                        attributes: token.attributes,
                        children: [],
                        parent: currentParent,
                    };
                    currentParent.children.push(elementNode);
                    stack.push(elementNode);
                    currentParent = elementNode;
                    break;
                case "EndTag":
                    if (currentParent.name === token.name) {
                        stack.pop();
                        currentParent = stack[stack.length - 1];
                    }
                    else {
                        throw new Error(`Unmatched end tag: </${token.name}>. Expected </${currentParent.name}>.`);
                    }
                    break;
                case "Text":
                    const textNode = {
                        type: "Text",
                        value: token.value,
                        children: [],
                        parent: currentParent,
                    };
                    currentParent.children.push(textNode);
                    break;
                case "Comment":
                    const commentNode = {
                        type: "Comment",
                        value: token.value,
                        children: [],
                        parent: currentParent,
                    };
                    currentParent.children.push(commentNode);
                    break;
                default:
                    // This should never happen. Use a `never` check to catch unhandled cases.
                    const exhaustiveCheck = token;
                    throw new Error(`Unsupported token type: ${exhaustiveCheck}`);
            }
        }
        return this.root;
    }
    getRoot() {
        return this.root;
    }
    printAST(node = this.root, depth = 0) {
        const indent = "  ".repeat(depth);
        if (node.type === "Element") {
            console.log(`${indent}<${node.name}>`);
            node.children.forEach((child) => this.printAST(child, depth + 1));
            console.log(`${indent}</${node.name}>`);
        }
        else if (node.type === "Text") {
            console.log(`${indent}${node.value}`);
        }
        else if (node.type === "Comment") {
            console.log(`${indent}<!-- ${node.value} -->`);
        }
    }
}
export { AST };
//# sourceMappingURL=index.js.map