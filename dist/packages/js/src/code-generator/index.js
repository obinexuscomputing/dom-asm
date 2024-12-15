export class CodeGenerator {
    generate(ast) {
        if (ast.type === 'Program') {
            return ast.children?.map((child) => this.generate(child)).join('\n') || '';
        }
        if (ast.type === 'VariableDeclaration') {
            return `const ${ast.children?.[0].value} = ${ast.children?.[1].value};`;
        }
        if (ast.type === 'InlineConstant') {
            return `${ast.value};`;
        }
        return '';
    }
}
//# sourceMappingURL=index.js.map