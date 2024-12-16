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
    });

    it('should handle validation errors', () => {
      const source = 'const = 42;';
      const result = generator.generateFromSource(source, { validate: true });

      expect(result.success).toBe(false);
      expect(result.validationErrors).toBeDefined();
    });

    it('should handle syntax errors', () => {
      const source = 'const @invalid = 42;';
      const result = generator.generateFromSource(source);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
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
    });

    it('should validate AST when requested', () => {
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
      expect(result.validationErrors).toBeDefined();
    });
  });

  describe('Formatting Options', () => {
    it('should format output in compact mode', () => {
      const ast: TypedJSASTNode = {
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

      const result = generator.generateFromAST(ast, { format: 'compact' });
      expect(result.success).toBe(true);
      expect(result.code).not.toContain('\n');
    });

    it('should format output in pretty mode', () => {
      const ast: TypedJSASTNode = {
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

      const result = generator.generateFromAST(ast, { format: 'pretty' });
      expect(result.success).toBe(true);
      expect(result.code).toContain('\n');
    });
  });
});