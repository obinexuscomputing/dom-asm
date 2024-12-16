import { JSValidator, ValidationError } from '../src/validator/JSValidator';
import { JSASTNode } from '../src/ast';

describe('JSValidator', () => {
  let validator: JSValidator;

  beforeEach(() => {
    validator = new JSValidator();
  });

  describe('Program Node Validation', () => {
    it('should validate an empty program', () => {
      const ast: JSASTNode = {
        type: 'Program',
        children: []
      };

      const errors = validator.validate(ast);
      expect(errors).toHaveLength(1);
      expect(errors[0].code).toBe('E002');
    });

    it('should validate a valid program', () => {
      const ast: JSASTNode = {
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

      const errors = validator.validate(ast);
      expect(errors).toHaveLength(0);
    });

    it('should detect multiple default exports', () => {
      const ast: JSASTNode = {
        type: 'Program',
        children: [
          { type: 'ExportDeclaration', value: 'default', children: [] },
          { type: 'ExportDeclaration', value: 'default', children: [] }
        ]
      };

      const errors = validator.validate(ast);
      expect(errors).toHaveLength(1);
      expect(errors[0].code).toBe('E003');
    });
  });

  describe('Variable Declaration Validation', () => {
    it('should validate a valid variable declaration', () => {
      const ast: JSASTNode = {
        type: 'VariableDeclaration',
        value: 'const',
        children: [
          { type: 'Identifier', value: 'x' },
          { type: 'Literal', value: '42' }
        ]
      };

      const errors = validator.validate(ast);
      expect(errors).toHaveLength(0);
    });

    it('should detect missing declaration kind', () => {
      const ast: JSASTNode = {
        type: 'VariableDeclaration',
        children: [
          { type: 'Identifier', value: 'x' },
          { type: 'Literal', value: '42' }
        ]
      };

      const errors = validator.validate(ast);
      expect(errors).toHaveLength(1);
      expect(errors[0].code).toBe('E005');
    });

    it('should validate destructuring patterns', () => {
      const ast: JSASTNode = {
        type: 'VariableDeclaration',
        value: 'const',
        children: [
          {
            type: 'DestructuringPattern',
            children: [
              { type: 'Identifier', value: 'x' },
              { type: 'Identifier', value: 'y' }
            ]
          },
          { type: 'ObjectExpression', children: [] }
        ]
      };

      const errors = validator.validate(ast);
      expect(errors).toHaveLength(0);
    });
  });

  describe('Modern JS Features Validation', () => {
    it('should validate arrow functions', () => {
      const ast: JSASTNode = {
        type: 'ArrowFunction',
        children: [
          { type: 'BlockStatement', children: [] }
        ]
      };

      const errors = validator.validate(ast);
      expect(errors).toHaveLength(0);
    });

    it('should validate template literals', () => {
      const ast: JSASTNode = {
        type: 'TemplateLiteral',
        children: [
          {
            type: 'TemplateLiteralExpression',
            value: 'expression',
            children: []
          }
        ]
      };

      const errors = validator.validate(ast);
      expect(errors).toHaveLength(0);
    });

    it('should validate class declarations', () => {
      const ast: JSASTNode = {
        type: 'ClassDeclaration',
        value: 'MyClass',
        children: [
          {
            type: 'MethodDefinition',
            value: 'constructor',
            children: [{ type: 'FunctionExpression', children: [] }]
          }
        ]
      };

      const errors = validator.validate(ast);
      expect(errors).toHaveLength(0);
    });

    it('should validate async functions', () => {
      const ast: JSASTNode = {
        type: 'AsyncFunction',
        children: [
          { type: 'BlockStatement', children: [] }
        ]
      };

      const errors = validator.validate(ast);
      expect(errors).toHaveLength(0);
    });
  });

  describe('Object and Array Pattern Validation', () => {
    it('should validate object expressions', () => {
      const ast: JSASTNode = {
        type: 'ObjectExpression',
        children: [
          {
            type: 'Property',
            value: 'prop1',
            children: [{ type: 'Literal', value: '42' }]
          }
        ]
      };

      const errors = validator.validate(ast);
      expect(errors).toHaveLength(0);
    });

    it('should detect duplicate object keys', () => {
      const ast: JSASTNode = {
        type: 'ObjectExpression',
        children: [
          { type: 'Property', value: 'prop1' },
          { type: 'Property', value: 'prop1' }
        ]
      };

      const errors = validator.validate(ast);
      expect(errors).toHaveLength(1);
      expect(errors[0].code).toBe('E010');
    });

    it('should validate spread elements', () => {
      const ast: JSASTNode = {
        type: 'SpreadElement',
        children: [
          { type: 'Identifier', value: 'obj' }
        ]
      };

      const errors = validator.validate(ast);
      expect(errors).toHaveLength(0);
    });
  });

  describe('Import/Export Validation', () => {
    it('should validate import declarations', () => {
      const ast: JSASTNode = {
        type: 'ImportDeclaration',
        children: [
          { type: 'Identifier', value: 'foo' }
        ]
      };

      const errors = validator.validate(ast);
      expect(errors).toHaveLength(0);
    });

    it('should validate export declarations', () => {
      const ast: JSASTNode = {
        type: 'ExportDeclaration',
        children: [
          { type: 'Identifier', value: 'foo' }
        ]
      };

      const errors = validator.validate(ast);
      expect(errors).toHaveLength(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle unknown node types', () => {
      const ast: JSASTNode = {
        type: 'UnknownType' as any,
        children: []
      };

      const errors = validator.validate(ast);
      expect(errors).toHaveLength(1);
      expect(errors[0].code).toBe('E001');
    });

    it('should handle null values', () => {
      const ast: JSASTNode = {
        type: 'Literal',
        value: undefined,
        children: []
      };

      const errors = validator.validate(ast);
      expect(errors).toHaveLength(1);
      expect(errors[0].code).toBe('E026');
    });

    it('should validate deeply nested structures', () => {
      const ast: JSASTNode = {
        type: 'Program',
        children: [
          {
            type: 'ClassDeclaration',
            value: 'MyClass',
            children: [
              {
                type: 'MethodDefinition',
                value: 'method',
                children: [
                  {
                    type: 'AsyncFunction',
                    children: [
                      { type: 'BlockStatement', children: [] }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      };

      const errors = validator.validate(ast);
      expect(errors).toHaveLength(0);
    });
  });
});