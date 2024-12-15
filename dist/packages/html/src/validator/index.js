class Validator {
    namespaceRules = {
        "html": ["html", "head", "body", "title", "meta", "link", "p", "div", "a", "img", "media"],
    };
    attributeRules = {
        "html:a": ["href", "title"],
        "html:img": ["src", "alt", "width", "height"],
        "html:media": ["src", "type", "controls", "autostart"],
    };
    validationCache = new Map();
    registerNamespace(namespace, tags) {
        this.namespaceRules[namespace] = tags;
    }
    registerAttributes(tag, attributes) {
        this.attributeRules[tag] = attributes;
    }
    validateAST(ast) {
        const cacheKey = this.getCacheKey(ast);
        if (this.validationCache.has(cacheKey)) {
            return this.validationCache.get(cacheKey);
        }
        const errors = [];
        this.traverseAST(ast, errors);
        const result = { valid: errors.length === 0, errors };
        this.validationCache.set(cacheKey, result);
        return result;
    }
    traverseAST(node, errors) {
        if (node.type === "Element") {
            this.validateElement(node, errors);
        }
        for (const child of node.children) {
            this.traverseAST(child, errors);
        }
    }
    validateElement(node, errors) {
        if (!node.name)
            return;
        const [namespace, tagName] = node.name.split(":");
        if (!this.namespaceRules[namespace]) {
            errors.push(`Unknown namespace: ${namespace} in <${node.name}>`);
        }
        else if (!this.namespaceRules[namespace].includes(tagName)) {
            errors.push(`Invalid tag <${node.name}> in namespace ${namespace}`);
        }
        if (node.attributes) {
            for (const [attr, value] of Object.entries(node.attributes)) {
                const validAttributes = this.attributeRules[node.name] || [];
                if (!validAttributes.includes(attr)) {
                    errors.push(`Invalid attribute "${attr}" on <${node.name}>`);
                }
            }
        }
    }
    getCacheKey(node) {
        return JSON.stringify(node, (key, value) => key === "parent" ? undefined : value // Exclude parent references to avoid circular structure
        );
    }
}
export { Validator };
//# sourceMappingURL=index.js.map