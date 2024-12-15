import { CodeGenerator } from '../src/code-generator';
describe('CodeGenerator', () => {
    const generator = new CodeGenerator();
    it('should generate code for an optimized AST', () => {
        const ast = {
            type: 'Program',
            children: [{ type: 'InlineConstant', value: 'x=42' }],
        };
        const code = generator.generate(ast);
        expect(code).toBe('x=42;');
    });
});
//# sourceMappingURL=generator.test.js.map