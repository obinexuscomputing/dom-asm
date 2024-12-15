export class JSCodeGenerator {
    generate(ast) {
        if (ast.type === 'stylesheet') {
            return ast.children?.map((child) => this.generate(child)).join('\n') || '';
        }
        if (ast.type === 'rule') {
            const selector = ast.children.find((child) => child.type === 'selector');
            const declarations = ast.children.filter((child) => child.type === 'declaration');
            return `${selector?.value} {\n${declarations.map((declaration) => this.generate(declaration)).join('\n')}\n}`;
        }
        if (ast.type === 'declaration') {
            const property = ast.children.find((child) => child.type === 'property');
            const value = ast.children.find((child) => child.type === 'value');
            return `  ${property?.value}: ${value?.value};`;
        }
        return '';
    }
}
//# sourceMappingURL=index.js.map