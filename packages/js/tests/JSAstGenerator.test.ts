import { JSGenerator, GeneratorOptions } from '../src/generator';
import { TypedJSASTNode } from '../src/parser';

describe('JSGenerator', () => {
  let generator: JSGenerator;

  beforeEach(() => {
    generator = new JSGenerator();
  });

  describe('Source Generation', () => {
    it('should generate code from valid source', () => {
      const source = 'const x = 42;';
      const result = generator.generateFromSource(source);

      expect(result.success).toBe(true);
      expect(result.code).toBe('Declare x 42');
      expect(result.ast).toBeDefined();
    });

    it('should handle validation errors', () => {
      const source = 'const = 42;';
      const result = generator.generateFromSource(source, { validate: true });

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
      expect(result.ast).toBeDefined();
    });

    it('should handle syntax errors', () => {
      const source = 'const @invalid = 42;';
      const result = generator.generateFromSource(source);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
    });
  });

  describe('AST Generation', () => {
    it('should generate code from valid AST', () => {
      const ast: TypedJSASTNode = {
        type: 'Program',
        children: [
          {
            type: 'VariableDeclaration',
            value: 'const',
            children: [
              { type: 'Identifier', value: 'x' },
              { type: 'Literal', value: '42' }
            ]
          }
        ]
      };

      const result = generator.generateFromAST(ast);
      
      expect(result.success).toBe(true);
      expect(result.code).toBe('Declare x 42');
      expect(result.ast).toBeDefined();
    });

    it('should detect invalid AST', () => {
      const ast: TypedJSASTNode = {
        type: 'Program',
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

      const result = generator.generateFromAST(ast, { validate: true });
      
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
    });
  });

  describe('Formatting', () => {
    const complexAst: TypedJSASTNode = {
      type: 'Program',
      children: [
        {
          type: 'BlockStatement',
          children: [
            {
              type: 'VariableDeclaration',
              value: 'const',
              children: [
                { type: 'Identifier', value: 'x' },
                { type: 'Literal', value: '42' }
              ]
            }
          ]
        }
      ]
    };

    it('should format in compact mode', () => {
      const result = generator.generateFromAST(complexAst, { format: 'compact' });
      
      expect(result.success).toBe(true);
      expect(result.code).not.toContain('\n');
      expect(result.code).not.toMatch(/\s{2,}/);
    });

    it('should format in pretty mode', () => {
      const result = generator.generateFromAST(complexAst, { format: 'pretty' });
      
      expect(result.success).toBe(true);
      expect(result.code).toContain('\n');
      expect(result.code).toMatch(/\s{2,}/);
    });

    it('should respect custom indentation', () => {
      const result = generator.generateFromAST(complexAst, { 
        format: 'pretty',
        indent: '    ' 
      });
      
      expect(result.success).toBe(true);
      expect(result.code).toContain('    ');
    });
  });

  describe('Error Handling', () => {
    it('should handle undefined input gracefully', () => {
      const result = generator.generateFromSource(undefined as any);
      
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should handle malformed AST gracefully', () => {
      const result = generator.generateFromAST({} as any);
      
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should include original AST in validation errors', () => {
      const invalidAst: TypedJSASTNode = {
        type: 'Program',
        children: [
          { type: 'InvalidNode' as any }
        ]
      };

      const result = generator.generateFromAST(invalidAst, { validate: true });
      
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.ast).toBeDefined();
    });
  });
});