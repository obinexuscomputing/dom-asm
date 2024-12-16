import { HTMLValidator, HTMLValidationResult } from '../src/validator/HTMLValidator';
import { HTMLASTNode } from '../src/ast/HTMLAST';

// Helper function to create test cases
function createTestCase(
    validator: HTMLValidator,
    config: {
      name: string;
      node: HTMLASTNode;
      expectedValid: boolean;
      expectedErrors?: string[];
      expectedWarnings?: string[];
    }
  ) {
    it(config.name, () => {
      const result = validator.validate(config.node);
      expect(result.valid).toBe(config.expectedValid);
      
      if (config.expectedErrors) {
        expect(result.errors.map(e => e.code)).toEqual(
          expect.arrayContaining(config.expectedErrors)
        );
      }
      
      if (config.expectedWarnings) {
        expect(result.warnings.map(w => w.code)).toEqual(
          expect.arrayContaining(config.expectedWarnings)
        );
      }
    });
  }

  
describe('HTMLValidator', () => {
  let validator: HTMLValidator;

  describe('Language Agnostic Validation', () => {
    beforeEach(() => {
      validator = new HTMLValidator({
        strictMode: true,
        allowCustomElements: false
      });
    });

    describe('Basic Structure Tests', () => {
      it('should validate empty element nodes', () => {
        const node: HTMLASTNode = {
          type: 'Element',
          name: 'div',
          children: []
        };

        const result = validator.validate(node);
        expect(result.valid).toBe(true);
      });

      it('should reject elements without names', () => {
        const node: HTMLASTNode = {
          type: 'Element',
          children: []
        };

        const result = validator.validate(node);
        expect(result.valid).toBe(false);
        expect(result.errors[0].code).toBe('E001');
      });
    });

    describe('Content Model Tests', () => {
      it('should validate proper nesting of elements', () => {
        const node: HTMLASTNode = {
          type: 'Element',
          name: 'div',
          children: [
            {
              type: 'Element',
              name: 'p',
              children: [
                {
                    type: 'Text',
                    value: 'Test content',
                    children: []
                }
              ]
            }
          ]
        };

        const result = validator.validate(node);
        expect(result.valid).toBe(true);
      });

      it('should reject invalid content in void elements', () => {
        const node: HTMLASTNode = {
          type: 'Element',
          name: 'img',
          children: [
            {
                type: 'Text',
                value: 'Invalid content',
                children: []
            }
          ]
        };

        const result = validator.validate(node);
        expect(result.valid).toBe(false);
        expect(result.errors[0].code).toBe('E002');
      });
    });

    describe('Attribute Tests', () => {
      it('should validate valid attributes', () => {
        const node: HTMLASTNode = {
          type: 'Element',
          name: 'div',
          attributes: {
            id: 'test',
            class: 'container'
          },
          children: []
        };

        const result = validator.validate(node);
        expect(result.valid).toBe(true);
      });

      it('should reject invalid attribute values', () => {
        const node: HTMLASTNode = {
          type: 'Element',
          name: 'div',
          attributes: {
            id: null as any
          },
          children: []
        };

        const result = validator.validate(node);
        expect(result.valid).toBe(false);
        expect(result.errors[0].code).toBe('E008');
      });
    });
  });

  describe('HTML5 Specific Tests', () => {
    beforeEach(() => {
      validator = new HTMLValidator({
        spec: 'html5',
        strictMode: true
      });
    });

    it('should validate valid HTML5 structure', () => {
      const node: HTMLASTNode = {
        type: 'Element',
        name: 'html',
        children: [
          {
            type: 'Element',
            name: 'head',
            children: [
              {
                type: 'Element',
                name: 'title',
                children: [
                  {
                      type: 'Text',
                      value: 'Test Document',
                      children: []
                  }
                ]
              }
            ]
          },
          {
            type: 'Element',
            name: 'body',
            children: []
          }
        ]
      };

      const result = validator.validate(node);
      expect(result.valid).toBe(true);
    });

    it('should reject invalid HTML5 elements', () => {
      const node: HTMLASTNode = {
        type: 'Element',
        name: 'invalid-element',
        children: []
      };

      const result = validator.validate(node);
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe('E006');
    });
  });

  describe('HTML6-XML Specific Tests', () => {
    beforeEach(() => {
      validator = new HTMLValidator({
        spec: 'html6-xml',
        allowNamespaces: true,
        customNamespaces: ['html', 'custom']
      });
    });

    it('should validate valid XML namespaced elements', () => {
      const node: HTMLASTNode = {
        type: 'Element',
        name: 'html:div',
        children: [
          {
            type: 'Element',
            name: 'custom:element',
            children: []
          }
        ]
      };

      const result = validator.validate(node);
      expect(result.valid).toBe(true);
    });

    it('should reject invalid XML namespaces', () => {
      const node: HTMLASTNode = {
        type: 'Element',
        name: 'unknown:element',
        children: []
      };

      const result = validator.validate(node);
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe('E005');
    });
  });

  describe('Mixed Content Tests', () => {
    beforeEach(() => {
      validator = new HTMLValidator({
        spec: 'html6-xml',
        allowNamespaces: true,
        allowCustomElements: true,
        customNamespaces: ['html', 'custom']
      });
    });

    it('should validate mixed HTML5 and XML content', () => {
      const node: HTMLASTNode = {
        type: 'Element',
        name: 'html:html',
        children: [
          {
            type: 'Element',
            name: 'html:body',
            children: [
              {
                type: 'Element',
                name: 'div',
                children: [
                  {
                    type: 'Element',
                    name: 'custom:widget',
                    children: []
                  }
                ]
              }
            ]
          }
        ]
      };

      const result = validator.validate(node);
      expect(result.valid).toBe(true);
    });

    it('should handle deeply nested mixed content', () => {
      const createNestedStructure = (depth: number): HTMLASTNode => {
        if (depth === 0) {
          return {
            type: 'Element',
            name: 'custom:leaf',
            children: [
              {
                  type: 'Text',
                  value: 'Test content',
                  children: []
              }
            ]
          };
        }

        return {
          type: 'Element',
          name: depth % 2 === 0 ? `html:div-${depth}` : `div-${depth}`,
          children: [createNestedStructure(depth - 1)]
        };
      };

      const node = createNestedStructure(5);
      const result = validator.validate(node);
      expect(result.valid).toBe(true);
    });
  });

  describe('Error Recovery and Warning Tests', () => {
    beforeEach(() => {
      validator = new HTMLValidator({
        strictMode: false,
        allowCustomElements: true
      });
    });

    it('should emit warnings for suspicious patterns', () => {
      const node: HTMLASTNode = {
        type: 'Element',
        name: 'div',
        attributes: {
          'onclick': 'alert("test")',
          'onunknown': 'test()'
        },
        children: []
      };

      const result = validator.validate(node);
      expect(result.valid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0].code).toBe('W001');
    });

    it('should accumulate multiple errors', () => {
      const node: HTMLASTNode = {
        type: 'Element',
        name: 'invalid:element',
        attributes: {
          'invalid@attr': 'test'
        },
        children: [
          {
            type: 'Element',
            name: 'img',
            children: [
              {
                  type: 'Text',
                  value: 'Invalid content',
                  children: []
              }
            ]
          }
        ]
      };

      const result = validator.validate(node);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });
});

