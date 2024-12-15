export class ASTOptimizer {
    constructor(ast) {
        this.ast = ast;
    }
    removeDuplicateDeclarations(node) {
        if (node.type === 'rule') {
            const declarations = node.children.filter((child) => child.type === 'declaration');
            const uniqueDeclarations = {};
            for (const declaration of declarations) {
                const propertyNode = declaration.children.find((child) => child.type === 'property');
                if (propertyNode && propertyNode.value) {
                    uniqueDeclarations[propertyNode.value] = declaration;
                }
            }
            node.children = node.children.filter((child) => child.type !== 'declaration').concat(Object.values(uniqueDeclarations));
        }
        for (const child of node.children) {
            this.removeDuplicateDeclarations(child);
        }
    }
    mergeAdjacentRules(node) {
        if (node.type === 'stylesheet') {
            const ruleMap = {};
            node.children = node.children.filter((child) => {
                if (child.type === 'rule') {
                    const selector = child.children.find((c) => c.type === 'selector');
                    if (selector && selector.value) {
                        if (ruleMap[selector.value]) {
                            ruleMap[selector.value].children.push(...child.children.filter((c) => c.type === 'declaration'));
                            return false;
                        }
                        else {
                            ruleMap[selector.value] = child;
                        }
                    }
                }
                return true;
            });
        }
        for (const child of node.children) {
            this.mergeAdjacentRules(child);
        }
    }
    optimize() {
        this.removeDuplicateDeclarations(this.ast);
        this.mergeAdjacentRules(this.ast);
        return this.ast;
    }
}
//# sourceMappingURL=index.js.map