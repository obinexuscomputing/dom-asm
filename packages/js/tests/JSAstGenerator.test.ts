import { NodeType } from '../src';
import {  GeneratorOptions, JSASTGenerator } from '../src/generator';
import { TypedJSASTNode } from '../src/types';

describe('JSGenerator', () => {
  let generator: JSASTGenerator;
  let astGenerator: JSASTGenerator;
  beforeEach(() => {
    generator = new JSASTGenerator();
    astGenerator = new JSASTGenerator();
  });
  const complexAst = {
    type: NodeType.Program,
    children: [
      {
        type: NodeType.BlockStatement,
        children: [
          {
            type: NodeType.VariableDeclaration,
            value: 'const',
            children: [
              { type: NodeType.Identifier, value: 'x' },
              { type: NodeType.Literal, value: '42' },
            ],
          },
        ],
      },
    ],
  };

  it('should generate code from a valid AST', () => {
    const result = astGenerator.generateFromAST(complexAst);
    expect(result.success).toBe(true);
    expect(result.code).toBe('const x = 42;');
  });

  it('should validate and reject an invalid AST', () => {
    const invalidAst = {
      type: NodeType.Program,
      children: [
        {
          type: NodeType.VariableDeclaration,
          children: [{ type: NodeType.Identifier, value: 'x' }],
        },
      ],
    };

    const result = astGenerator.generateFromAST(invalidAst, { validate: true });
    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.errors?.length).toBeGreaterThan(0);
  });

  it('should generate compact code', () => {
    const result = astGenerator.generateFromAST(complexAst, { format: 'compact' });
    expect(result.success).toBe(true);
    expect(result.code).toBe('const x=42;');
  });

  it('should handle empty source gracefully', () => {
    const result = astGenerator.generateFromSource('');
    expect(result.success).toBe(false);
    expect(result.errors?.[0].message).toBe('Source code cannot be undefined or empty');
  });

  it('should generate code from a valid AST', () => {
    const ast = {
      type: NodeType.Program,
      children: [
        {
          type: NodeType.VariableDeclaration,
          value: 'const',
          children: [
            { type: NodeType.Identifier, value: 'x' },
            { type: NodeType.Literal, value: '42' },
          ],
        },
      ],
    };

    const result = generator.generateFromAST(ast);
    expect(result.success).toBe(true);
    expect(result.code).toBe('const x = 42;');
  });

  it('should validate and reject an invalid AST', () => {
    const ast = {
      type: NodeType.Program,
      children: [
        {
          type: NodeType.VariableDeclaration,
          children: [{ type: NodeType.Identifier, value: 'x' }],
        },
      ],
    };

    const result = generator.generateFromAST(ast, { validate: true });
    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.errors?.length).toBeGreaterThan(0);
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
        type: NodeType.Program,
        children: [
          {
            type: NodeType.VariableDeclaration,
            value: 'const',
            children: [
              { type: NodeType.Identifier, value: 'x' },
              { type: NodeType.Literal, value: '42' },
            ],
          },
        ],
      };
  
      const result = generator.generateFromAST(ast);
  
      expect(result.success).toBe(true);
      expect(result.code).toBe('Declare x 42');
      expect(result.ast).toBeDefined();
    });
  
    it('should detect invalid AST', () => {
      const ast: TypedJSASTNode = {
        type: NodeType.Program,
        children: [
          {
            type: NodeType.VariableDeclaration,
            children: [
              { type: NodeType.Identifier, value: 'x' },
              { type: NodeType.Literal, value: '42' },
            ],
          },
        ],
      };
  
      const result = generator.generateFromAST(ast, { validate: true });
  
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
    });
  });
  
  describe('Formatting', () => {
    const complexAst: TypedJSASTNode = {
      type: NodeType.Program,
      children: [
        {
          type: NodeType.BlockStatement,
          children: [
            {
              type: NodeType.VariableDeclaration,
              value: 'const',
              children: [
                { type: NodeType.Identifier, value: 'x' },
                { type: NodeType.Literal, value: '42' },
              ],
            },
          ],
        },
      ],
    };
  
    it('should format in compact mode', () => {
      const result = generator.generateFromAST(complexAst, { format: 'compact' });
  
      expect(result.success).toBe(true);
      expect(result.code).not.toContain('\n');
      expect(result.code).not.toMatch(/\s{2,}/);
    });
  });
  

    it('should format in pretty mode', () => {
      const result = generator.generateFromAST(complexAst, { 
        format: 'pretty' 
      });
      
      const code = result.code as string;
      expect(result.success).toBe(true);
      expect(code).toContain('\n');
      expect(code.split('\n').length).toBeGreaterThan(1);
      expect(code).toMatch(/^\s+/m); // Should have indentation
    });

    it('should respect custom indentation', () => {
      const result = generator.generateFromAST(complexAst, { 
        format: 'pretty',
        indent: '    ' 
      });
      
      const code = result.code as string;
      expect(result.success).toBe(true);
      expect(code.split('\n').some(line => line.startsWith('    '))).toBe(true);
    });
  });


