import { JSParser, TypedJSASTNode } from '../src/parser';

describe('JSParser', () => {
  let parser: JSParser;

  beforeEach(() => {
    parser = new JSParser();
  });

  describe('Program Node', () => {
    it('should parse an empty program', () => {
      const ast: TypedJSASTNode = {
        type: 'Program',
        children: []
      };
      expect(parser.parse(ast)).toEqual([]);
    });

    it('should parse a program with multiple statements', () => {
      const ast: TypedJSASTNode = {
        type: 'Program',
        children: [
          {
            type: 'VariableDeclaration',
            children: [
              { type: 'Identifier', value: 'x' },
              { type: 'Literal', value: '42' }
            ]
          },
          {
            type: 'InlineConstant',
            value: 'y=10'
          }
        ]
      };
      expect(parser.parse(ast)).toEqual([
        'Declare x 42',
        'Inline y=10'
      ]);
    });
  });

  describe('Statement Nodes', () => {
    it('should parse a basic statement', () => {
      const ast: TypedJSASTNode = {
        type: 'Statement',
        children: [
          { type: 'Expression', value: 'test' }
        ]
      };
      expect(parser.parse(ast)).toBe('Statement: test');
    });

    it('should parse multiple statements', () => {
      const ast: TypedJSASTNode = {
        type: 'Statement',
        children: [
          { type: 'Expression', value: 'first' },
          { type: 'Expression', value: 'second' }
        ]
      };
      expect(parser.parse(ast)).toBe('Statement: first; second');
    });
  });

  describe('Expression Nodes', () => {
    it('should parse a binary expression', () => {
      const ast: TypedJSASTNode = {
        type: 'BinaryExpression',
        value: '+',
        children: [
          { type: 'Literal', value: '1' },
          { type: 'Literal', value: '2' }
        ]
      };
      expect(parser.parse(ast)).toBe('(1 + 2)');
    });
  });

  describe('Block Statement Nodes', () => {
    it('should parse an empty block', () => {
      const ast: TypedJSASTNode = {
        type: 'BlockStatement',
        children: []
      };
      expect(parser.parse(ast)).toBe('{ }');
    });

    it('should parse a block with statements', () => {
      const ast: TypedJSASTNode = {
        type: 'BlockStatement',
        children: [
          {
            type: 'VariableDeclaration',
            children: [
              { type: 'Identifier', value: 'x' },
              { type: 'Literal', value: '42' }
            ]
          }
        ]
      };
      expect(parser.parse(ast)).toBe('{ Declare x 42 }');
    });
  });

  describe('If Statement Nodes', () => {
    it('should parse if statement without else', () => {
      const ast: TypedJSASTNode = {
        type: 'IfStatement',
        children: [
          { type: 'Expression', value: 'condition' },
          { type: 'Statement', value: 'consequence' }
        ]
      };
      expect(parser.parse(ast)).toBe('if (condition) consequence');
    });

    it('should parse if statement with else', () => {
      const ast: TypedJSASTNode = {
        type: 'IfStatement',
        children: [
          { type: 'Expression', value: 'condition' },
          { type: 'Statement', value: 'consequence' },
          { type: 'Statement', value: 'alternate' }
        ]
      };
      expect(parser.parse(ast)).toBe('if (condition) consequence else alternate');
    });
  });

  describe('Function Declaration Nodes', () => {
    it('should parse a function declaration', () => {
      const ast: TypedJSASTNode = {
        type: 'FunctionDeclaration',
        value: 'test',
        children: [
          {
            type: 'BlockStatement',
            children: [
              {
                type: 'ReturnStatement',
                children: [
                  { type: 'Literal', value: '42' }
                ]
              }
            ]
          }
        ]
      };
      expect(parser.parse(ast)).toBe('function test { return 42 }');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty children', () => {
      const ast: TypedJSASTNode = {
        type: 'Statement',
        children: []
      };
      expect(parser.parse(ast)).toBe('Statement: ');
    });

    it('should handle empty values', () => {
      const ast: TypedJSASTNode = {
        type: 'Expression',
        value: '',
        children: []
      };
      expect(parser.parse(ast)).toBe('Expression: ');
    });

    it('should handle deeply nested structures', () => {
      const ast: TypedJSASTNode = {
        type: 'Program',
        children: [
          {
            type: 'BlockStatement',
            children: [
              {
                type: 'IfStatement',
                children: [
                  { type: 'Expression', value: 'true' },
                  {
                    type: 'BlockStatement',
                    children: [
                      {
                        type: 'VariableDeclaration',
                        children: [
                          { type: 'Identifier', value: 'x' },
                          { type: 'Literal', value: '42' }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      };
      expect(parser.parse(ast)).toEqual([
        '{ if (true) { Declare x 42 } }'
      ]);
    });
  });
});