import { JSValidator } from '../src/validator';
import { NodeType, JSASTNode } from '../src/types';

describe('JSValidator', () => {
  let validator: JSValidator;

  beforeEach(() => {
    validator = new JSValidator();
  });

  describe('Program Node Validation', () => {
    it('should detect empty program', () => {
      const ast: JSASTNode = {
        type: NodeType.Program,
        children: []
      };

      const errors = validator.validate(ast);
      expect(errors).toHaveLength(1);
      expect(errors[0].code).toBe('E002');
    });

    it('should validate a valid program', () => {
      const ast: JSASTNode = {
        type: NodeType.Program,
        children: [
          {
            type: NodeType.VariableDeclaration,
            value: 'const',
            children: [
              { type: NodeType.Identifier, value: 'x' },
              { type: NodeType.Literal, value: '42' }
            ]
          }
        ]
      };

      const errors = validator.validate(ast);
      expect(errors).toHaveLength(0);
    });
  });

  describe('Variable Declaration Validation', () => {
    it('should detect missing declaration kind', () => {
      const ast: JSASTNode = {
        type: NodeType.VariableDeclaration,
        children: [
          { type: NodeType.Identifier, value: 'x' },
          { type: NodeType.Literal, value: '42' }
        ]
      };

      const errors = validator.validate(ast);
      expect(errors).toHaveLength(1);
      expect(errors[0].code).toBe('E005');
    });

    it('should validate a proper variable declaration', () => {
      const ast: JSASTNode = {
        type: NodeType.VariableDeclaration,
        value: 'const',
        children: [
          { type: NodeType.Identifier, value: 'x' },
          { type: NodeType.Literal, value: '42' }
        ]
      };

      const errors = validator.validate(ast);
      expect(errors).toHaveLength(0);
    });
  });

  describe('Modern JS Features Validation', () => {
    it('should validate a proper arrow function', () => {
      const ast: JSASTNode = {
        type: NodeType.ArrowFunction,
        children: [
          {
            type: NodeType.BlockStatement,
            children: []
          }
        ]
      };

      const errors = validator.validate(ast);
      expect(errors).toHaveLength(0);
    });

    it('should validate template literals', () => {
      const ast: JSASTNode = {
        type: NodeType.TemplateLiteral,
        children: [
          { type: NodeType.Literal, value: 'expression' }
        ]
      };

      const errors = validator.validate(ast);
      expect(errors).toHaveLength(0);
    });

    it('should validate class declarations', () => {
      const ast: JSASTNode = {
        type: NodeType.ClassDeclaration,
        value: 'MyClass',
        children: [
          {
            type: NodeType.MethodDefinition,
            value: 'constructor',
            children: []
          }
        ]
      };

      const errors = validator.validate(ast);
      expect(errors).toHaveLength(0);
    });

    it('should detect unnamed class declaration', () => {
      const ast: JSASTNode = {
        type: NodeType.ClassDeclaration,
        children: []
      };

      const errors = validator.validate(ast);
      expect(errors).toHaveLength(1);
      expect(errors[0].code).toBe('E015');
    });
  });

  describe('Object Expression Validation', () => {
    it('should validate proper object expressions', () => {
      const ast: JSASTNode = {
        type: NodeType.ObjectExpression,
        children: [
          {
            type: NodeType.Property,
            value: 'prop1',
            children: [{ type: NodeType.Literal, value: '42' }]
          }
        ]
      };

      const errors = validator.validate(ast);
      expect(errors).toHaveLength(0);
    });

    it('should detect duplicate object keys', () => {
      const ast: JSASTNode = {
        type: NodeType.ObjectExpression,
        children: [
          { type: NodeType.Property, value: 'prop1' },
          { type: NodeType.Property, value: 'prop1' }
        ]
      };

      const errors = validator.validate(ast);
      const duplicateErrors = errors.filter(e => e.code === 'E010');
      expect(duplicateErrors).toHaveLength(1);
      expect(duplicateErrors[0].message).toContain('prop1');
    });
  });

  describe('Import/Export Validation', () => {
    it('should validate proper imports', () => {
      const ast: JSASTNode = {
        type: NodeType.ImportDeclaration,
        children: [
          { type: NodeType.Identifier, value: 'foo' }
        ]
      };

      const errors = validator.validate(ast);
      expect(errors).toHaveLength(0);
    });

    it('should detect empty imports', () => {
      const ast: JSASTNode = {
        type: NodeType.ImportDeclaration,
        children: []
      };

      const errors = validator.validate(ast);
      expect(errors).toHaveLength(1);
      expect(errors[0].code).toBe('E021');
    });
  });

  describe('Edge Cases', () => {
    it('should detect unknown node types', () => {
      const ast: JSASTNode = {
        type: 'UnknownType' as any,
        children: []
      };

      const errors = validator.validate(ast);
      expect(errors).toHaveLength(1);
      expect(errors[0].code).toBe('E001');
    });

    it('should handle nested valid structures', () => {
      const ast: JSASTNode = {
        type: NodeType.Program,
        children: [
          {
            type: NodeType.ClassDeclaration,
            value: 'MyClass',
            children: [
              {
                type: NodeType.MethodDefinition,
                value: 'method',
                children: [
                  {
                    type: NodeType.BlockStatement,
                    children: []
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