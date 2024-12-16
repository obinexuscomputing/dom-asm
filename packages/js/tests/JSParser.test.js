import { Parser } from '../src/parser';
import { ASTNode } from '../src/ast';

describe('Parser', () => {
  const parser = new Parser();

  it('should parse an optimized AST into an intermediate representation', () => {
    const ast: ASTNode = {
      type: 'Program',
      children: [{ type: 'InlineConstant', value: 'x=42' }],
    };

    const ir = parser.parse(ast);

    expect(ir).toEqual(['Inline x=42']);
  });
});
