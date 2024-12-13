// Example usage:
// import { Tokenizer } from "../tokenizer";
// import { ASTBuilder } from "../ast";
export class Validator {
    ast;
    errors;
    constructor(ast) {
        this.ast = ast;
        this.errors = [];
    }
    validateStylesheet(node) {
        if (node.type !== 'stylesheet') {
            this.errors.push(`Invalid root node type: ${node.type}`);
        }
        for (const child of node.children) {
            if (child.type === 'rule') {
                this.validateRule(child);
            }
            else {
                this.errors.push(`Invalid child node type in stylesheet: ${child.type}`);
            }
        }
    }
    validateRule(node) {
        const selector = node.children.find((child) => child.type === 'selector');
        if (!selector || !selector.value) {
            this.errors.push(`Missing or invalid selector in rule.`);
        }
        const declarations = node.children.filter((child) => child.type === 'declaration');
        for (const declaration of declarations) {
            this.validateDeclaration(declaration);
        }
    }
    validateDeclaration(node) {
        const property = node.children.find((child) => child.type === 'property');
        const value = node.children.find((child) => child.type === 'value');
        if (!property || !property.value) {
            this.errors.push(`Missing or invalid property in declaration.`);
        }
        if (!value || !value.value) {
            this.errors.push(`Missing or invalid value in declaration.`);
        }
    }
    validate() {
        this.validateStylesheet(this.ast);
        return this.errors;
    }
}
