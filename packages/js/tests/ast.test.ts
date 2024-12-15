import { Tokenizer, TokenType } from '../src/tokenizer';
import { JSASTBuilder } from '../src/ast';

describe('ASTBuilder', () => {
  const tokenizer = new Tokenizer();
  const astBuilder = new JSASTBuilder(ast);

  it('should build an AST for a variable declaration', () => {
    const code = 'const x = 42;';
    const tokens = tokenizer.tokenize(code);
    const ast = astBuilder.build(tokens);

    expect(ast).toEqual({
      type: 'Program',
      children: [
        {
          type: 'VariableDeclaration',
          value: 'const',
          children: [
            { type: 'Identifier', value: 'x' },
            { type: 'Literal', value: '42' },
          ],
        },
      ],
    });
  });


it('should throw an error for invalid syntax', () => {
  const tokens = tokenizer.tokenize('const x;');
  expect(() => astBuilder.build(tokens)).toThrow('Unexpected token: EOF');
});

});
