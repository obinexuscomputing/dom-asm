// tests/ast.test.ts
import { JSTokenizer } from '../src/tokenizer/JSTokenizer';
import { JSASTBuilder } from '../src/ast/JSAst';

describe('JSASTBuilder', () => {
  let tokenizer: JSTokenizer;

  beforeEach(() => {
    tokenizer = new JSTokenizer();
  });

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
            { type: "Literal", value: "42", children: [] }
          ]
        }
      ]
    });
  });

  it('should throw an error for invalid syntax', () => {
    const tokens = tokenizer.tokenize('const x;');
    const astBuilder = new JSASTBuilder(tokens);
    expect(() => astBuilder.buildAST()).toThrow('Expected \'=\' after identifier');
  });
});