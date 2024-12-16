import { JSParser } from '../src/parser';
import { JSASTNode } from '../src/ast';

describe('JSParser', () => {
  let parser: JSParser;

  beforeEach(() => {
    parser = new JSParser();
  });

  describe('Program Node', () => {
    it('should parse an empty program', () => {
      const ast: JSASTNode = {
        type: 'Program',
        children: []
      };
      expect(parser.parse(ast)).toEqual([]);
    });

    it('should parse a program with multiple statements', () => {
      const ast: JSASTNode = {
        type: 'Program',
        children: [
          {
            type: 'VariableDeclaration',
            children: [
              { type: 'Identifier', value: 'x', children: [] },
              { type: 'Literal', value: '42', children: [] }
            ]
          },
          {
            type: 'InlineConstant',
            value: 'y=10',
            children: []
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
      const ast: JSASTNode = {
        type: 'Statement',
        children: [
          { type: 'Expression', value: 'test', children: [] }
        ]
      };
      expect(parser.parse(ast)).toBe('Statement: test');
    });

    it('should parse multiple statements', () => {
      const ast: JSASTNode = {
        type: 'Statement',
        children: [
          { type: 'Expression', value: 'first', children: [] },
          { type: 'Expression', value: 'second', children: [] }
        ]
      };
      expect(parser.parse(ast)).toBe('Statement: first; second');
    });
  });

  describe('Expression Nodes', () => {
    it('should parse a simple expression', () => {
      const ast: JSASTNode = {
        type: 'Expression',
        children: [
          { type: 'Literal', value: '42', children: [] }
        ]
      };
      expect(parser.parse(ast)).toBe('Expression: 42');
    });

    it('should parse a binary expression', () => {
      const ast: JSASTNode = {
        type: 'BinaryExpression',
        value: '+',
        children: [
          { type: 'Literal', value: '1', children: [] },
          { type: 'Literal', value: '2', children: [] }
        ]
      };
      expect(parser.parse(ast)).toBe('(1 + 2)');
    });
  });

  describe('Block Statement Nodes', () => {
    it('should parse an empty block', () => {
      const ast: JSASTNode = {
        type: 'BlockStatement',
        children: []
      };
      expect(parser.parse(ast)).toBe('{ }');
    });

    it('should parse a block with statements', () => {
      const ast: JSASTNode = {
        type: 'BlockStatement',
        children: [
          {
            type: 'VariableDeclaration',
            children: [
              { type: 'Identifier', value: 'x', children: [] },
              { type: 'Literal', value: '42', children: [] }
            ]
          }
        ]
      };
      expect(parser.parse(ast)).toBe('{ Declare x 42 }');
    });
  });

  describe('If Statement Nodes', () => {
    it('should parse if statement without else', () => {
      const ast: JSASTNode = {
        type: 'IfStatement',
        children: [
          { type: 'Expression', value: 'condition', children: [] },
          { type: 'Statement', value: 'consequence', children: [] }
        ]
      };
      expect(parser.parse(ast)).toBe('if (condition) Statement: consequence');
    });

    it('should parse if statement with else', () => {
      const ast: JSASTNode = {
        type: 'IfStatement',
        children: [
          { type: 'Expression', value: 'condition', children: [] },
          { type: 'Statement', value: 'consequence', children: [] },
          { type: 'Statement', value: 'alternate', children: [] }
        ]
      };
      expect(parser.parse(ast)).toBe('if (condition) Statement: consequence else Statement: alternate');
    });
  });

  describe('Function Declaration Nodes', () => {
    it('should parse a function declaration', () => {
      const ast: JSASTNode = {
        type: 'FunctionDeclaration',
        value: 'test',
        children: [
          {
            type: 'BlockStatement',
            children: [
              {
                type: 'ReturnStatement',
                children: [
                  { type: 'Literal', value: '42', children: [] }
                ]
              }
            ]
          }
        ]
      };
      expect(parser.parse(ast)).toBe('function test { return 42 }');
    });
  });

  describe('Variable Declarations', () => {
    it('should parse a simple variable declaration', () => {
      const ast: JSASTNode = {
        type: 'VariableDeclaration',
        children: [
          { type: 'Identifier', value: 'x', children: [] },
          { type: 'Literal', value: '42', children: [] }
        ]
      };
      expect(parser.parse(ast)).toBe('Declare x 42');
    });

    it('should parse a variable declaration with expression', () => {
      const ast: JSASTNode = {
        type: 'VariableDeclaration',
        children: [
          { type: 'Identifier', value: 'x', children: [] },
          {
            type: 'BinaryExpression',
            value: '+',
            children: [
              { type: 'Literal', value: '1', children: [] },
              { type: 'Literal', value: '2', children: [] }
            ]
          }
        ]
      };
      expect(parser.parse(ast)).toBe('Declare x (1 + 2)');
    });
  });

  describe('Edge Cases', () => {
    it('should handle null children', () => {
      const ast: JSASTNode = {
        type: 'Statement',
        children: null
      };
      expect(parser.parse(ast)).toBe('Statement: ');
    });

    it('should handle empty values', () => {
      const ast: JSASTNode = {
        type: 'Expression',
        value: '',
        children: []
      };
      expect(parser.parse(ast)).toBe('Expression: ');
    });

    it('should handle deeply nested structures', () => {
      const ast: JSASTNode = {
        type: 'Program',
        children: [
          {
            type: 'BlockStatement',
            children: [
              {
                type: 'IfStatement',
                children: [
                  { type: 'Expression', value: 'true', children: [] },
                  {
                    type: 'BlockStatement',
                    children: [
                      {
                        type: 'VariableDeclaration',
                        children: [
                          { type: 'Identifier', value: 'x', children: [] },
                          { type: 'Literal', value: '42', children: [] }
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