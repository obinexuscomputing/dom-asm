import { ASTOptimizer } from '../src/ast-optimizer';

describe('ASTOptimizer', () => {
  const optimizer = new ASTOptimizer();

  it('should optimize a constant declaration', () => {
    const ast = {
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
    };

    const optimizedAST = optimizer.optimize(ast);

    expect(optimizedAST).toEqual({
      type: 'Program',
      children: [{ type: 'InlineConstant', value: 'x=42' }],
    });
  });
});
