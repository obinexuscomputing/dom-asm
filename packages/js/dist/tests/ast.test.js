import { Tokenizer } from '../src/tokenizer';
import { JSASTBuilder } from '../src/ast';
describe('ASTBuilder', () => {
    const tokenizer = new Tokenizer();
    it('should build an AST for a variable declaration', () => {
        const code = 'const x = 42;';
        const tokens = tokenizer.tokenize(code);
        const astBuilder = new JSASTBuilder(tokens);
        const ast = astBuilder.buildAST();
        expect(ast).toEqual({
            type: "Program",
            children: [
                {
                    type: "VariableDeclaration",
                    children: [
                        { type: "Identifier", value: "x", children: [] },
                        { type: "Literal", value: "42", children: [] },
                    ],
                },
            ],
        });
    });
    it('should throw an error for invalid syntax', () => {
        const tokens = tokenizer.tokenize('const x;');
        const astBuilder = new JSASTBuilder(tokens);
        expect(() => astBuilder.buildAST()).toThrow('Unexpected token: EOF');
    });
});
//# sourceMappingURL=ast.test.js.map