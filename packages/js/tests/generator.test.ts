import { JSCodeGenerator } from '../src/generator';

describe('CodeGenerator', () => {
    const generator = new JSCodeGenerator();

    it('should generate code for an optimized AST', () => {
        const ast = {
            type: "Program",
            children: [{ type: "InlineConstant", value: "x=42", children: [] }],
        };

        const code = generator.generate(ast);

        expect(code).toBe("x=42;");
    });
});
