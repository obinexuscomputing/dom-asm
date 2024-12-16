import { JSASTBuilder } from '../src/ast';
import { JSToken, JSTokenType } from '../src/tokenizer';
import { NodeType } from '../src/ast/types';


describe('JSAst and JSAstMinimizer', () => {
  describe('JSASTBuilder', () => {
    let builder: JSASTBuilder;
    beforeEach(() => {
      builder = new JSASTBuilder([]);
    });
  
    it('should build a valid AST from tokens', () => {
      const tokens: JSToken[] = [
        { type: JSTokenType.Keyword, value: 'const' },
        { type: JSTokenType.Identifier, value: 'x' },
        { type: JSTokenType.Operator, value: '=' },
        { type: JSTokenType.Literal, value: '42' },
        { type: JSTokenType.Delimiter, value: ';' }
      ];
  
      builder = new JSASTBuilder(tokens);
      const ast = builder.buildAST();
  
      expect(ast.type).toBe(NodeType.Program);
      expect(ast.children?.[0]?.type).toBe(NodeType.VariableDeclaration);
    });

    describe('buildAST', () => {
      it('should create a valid Program node', () => {
        const tokens: JSToken[] = [
          { type: JSTokenType.EndOfStatement, value: 'EOF' }
        ];
        builder = new JSASTBuilder(tokens);
        
        const ast = builder.buildAST();
        
        expect(ast.type).toBe('Program');
        expect(Array.isArray(ast.children)).toBe(true);
      });

      it('should handle variable declarations', () => {
        const tokens: JSToken[] = [
          { type: JSTokenType.Keyword, value: 'const' },
          { type: JSTokenType.Identifier, value: 'x' },
          { type: JSTokenType.Operator, value: '=' },
          { type: JSTokenType.Literal, value: '42' },
          { type: JSTokenType.Delimiter, value: ';' },
          { type: JSTokenType.EndOfStatement, value: 'EOF' }
        ];
        builder = new JSASTBuilder(tokens);
        
        const ast = builder.buildAST();
        
        expect(ast.children?.length).toBe(1);
        expect(ast.children![0].type).toBe('VariableDeclaration');
        expect(ast.children![0].children?.length).toBe(2);
        expect(ast.children![0].children![0].value).toBe('x');
        expect(ast.children![0].children![1].value).toBe('42');
      });

      it('should throw error for invalid variable declaration', () => {
        const tokens: JSToken[] = [
          { type: JSTokenType.Keyword, value: 'const' },
          { type: JSTokenType.Literal, value: '42' }, // Invalid: identifier expected
          { type: JSTokenType.EndOfStatement, value: 'EOF' }
        ];
        builder = new JSASTBuilder(tokens);
        
        expect(() => builder.buildAST()).toThrow("Expected identifier after 'const'");
      });
    });
  });

  describe('JSAstMinimizer', () => {
    let minimizer: JSAstMinimizer;

    beforeEach(() => {
      minimizer = new JSAstMinimizer();
    });

    describe('minimize', () => {
      it('should deduplicate identical nodes', () => {
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
              type: 'VariableDeclaration',
              children: [
                { type: 'Identifier', value: 'y', children: [] },
                { type: 'Literal', value: '42', children: [] } // Duplicate literal
              ]
            }
          ]
        };

        const minimizedAst = minimizer.minimize(ast);
        
        // The literal '42' should be the same instance in both declarations
        const literal1 = minimizedAst.children![0].children![1];
        const literal2 = minimizedAst.children![1].children![1];
        expect(literal1).toBe(literal2);
      });
    });

    describe('optimize', () => {
      it('should inline constant declarations', () => {
        const ast: JSASTNode = {
          type: 'Program',
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

        const optimizedAst = minimizer.optimize(ast);
        
        expect(optimizedAst.children![0].type).toBe('InlineConstant');
        expect(optimizedAst.children![0].value).toBe('x=42');
      });

      it('should preserve non-constant declarations', () => {
        const ast: JSASTNode = {
          type: 'Program',
          children: [
            {
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
            }
          ]
        };

        const optimizedAst = minimizer.optimize(ast);
        
        expect(optimizedAst.children![0].type).toBe('VariableDeclaration');
      });
    });

    describe('edge cases', () => {
      it('should handle empty programs', () => {
        const ast: JSASTNode = {
          type: 'Program',
          children: []
        };

        const result = minimizer.optimize(ast);
        expect(result.type).toBe('Program');
        expect(result.children).toEqual([]);
      });

      it('should handle nodes without children', () => {
        const ast: JSASTNode = {
          type: 'Literal',
          value: '42'
        };

        const result = minimizer.minimize(ast);
        expect(result.type).toBe('Literal');
        expect(result.value).toBe('42');
      });

      it('should handle deeply nested structures', () => {
        const ast: JSASTNode = {
          type: 'Program',
          children: [
            {
              type: 'BlockStatement',
              children: [
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
        };

        const result = minimizer.optimize(ast);
        expect(result.type).toBe('Program');
        expect(result.children![0].type).toBe('BlockStatement');
        expect(result.children![0].children![0].type).toBe('BlockStatement');
      });
    });
  });
});