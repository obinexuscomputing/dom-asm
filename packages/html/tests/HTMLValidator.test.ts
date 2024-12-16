import { HTMLValidator } from '../src/validator/HTMLValidator';
import { HTMLASTNode } from '../src/ast/HTMLAST';

// Helper function to create test cases with proper typing
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
  function createValidatorTestCase(
    options: Parameters<HTMLValidator['constructor']>[0],
    config: {
      name: string;
      node: HTMLASTNode;
      expectedValid: boolean;
      expectedErrors?: string[];
      expectedWarnings?: string[];
    }
  ) {
    it(config.name, () => {
      const validator = new HTMLValidator(options);
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
  
  describe('Language Agnostic Validation', () => {
    beforeEach(() => {
      validator = new HTMLValidator({
        strictMode: false, // Changed to false to allow testing individual elements
        allowCustomElements: false
      });
    });

    describe('Basic Structure Tests', () => {
      createTestCase(validator, {
        name: 'should validate empty element nodes',
        node: {
          type: 'Element',
          name: 'div',
          children: []
        },
        expectedValid: true
      });

      createTestCase(validator, {
        name: 'should reject elements without names',
        node: {
          type: 'Element',
          children: []
        },
        expectedValid: false,
        expectedErrors: ['E001']
      });

      createTestCase(validator, {
        name: 'should validate basic text content',
        node: {
          type: 'Element',
          name: 'p',
          children: [
            {
              type: 'Text',
              value: 'Test content',
              children: []
            }
          ]
        },
        expectedValid: true
      });
    });

    describe('Content Model Tests', () => {
      createTestCase(validator, {
        name: 'should validate proper nesting of elements',
        node: {
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
        },
        expectedValid: true
      });

      createTestCase(validator, {
        name: 'should reject invalid content in void elements',
        node: {
          type: 'Element',
          name: 'img',
          children: [
            {
              type: 'Text',
              value: 'Invalid content',
              children: []
            }
          ]
        },
        expectedValid: false,
        expectedErrors: ['E002']
      });
    });

    describe('Attribute Tests', () => {
      createTestCase(validator, {
        name: 'should validate valid attributes',
        node: {
          type: 'Element',
          name: 'div',
          attributes: {
            id: 'test',
            class: 'container',
            'data-test': 'value'
          },
          children: []
        },
        expectedValid: true
      });

      createTestCase(validator, {
        name: 'should reject invalid attribute values',
        node: {
          type: 'Element',
          name: 'div',
          attributes: {
            id: null as any
          },
          children: []
        },
        expectedValid: false,
        expectedErrors: ['E008']
      });
    });
  });

  describe('HTML5 Specific Tests', () => {
    beforeEach(() => {
      validator = new HTMLValidator({
        spec: 'html5',
        strictMode: false
      });
    });

    createTestCase(validator, {
      name: 'should validate valid HTML5 structure',
      node: {
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
      },
      expectedValid: true
    });

    describe('Strict Mode Tests', () => {
      beforeEach(() => {
        validator = new HTMLValidator({
          spec: 'html5',
          strictMode: true,
          allowCustomElements: false
        });
      });

      createTestCase(validator, {
        name: 'should reject invalid HTML5 elements',
        node: {
          type: 'Element',
          name: 'invalid-element',
          children: []
        },
        expectedValid: false,
        expectedErrors: ['E006']
      });
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

    createTestCase(validator, {
      name: 'should validate valid XML namespaced elements',
      node: {
        type: 'Element',
        name: 'html:div',
        children: [
          {
            type: 'Element',
            name: 'custom:element',
            children: []
          }
        ]
      },
      expectedValid: true
    });

    createTestCase(validator, {
      name: 'should reject invalid XML namespaces',
      node: {
        type: 'Element',
        name: 'unknown:element',
        children: []
      },
      expectedValid: false,
      expectedErrors: ['E005']
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

    createTestCase(validator, {
      name: 'should validate mixed HTML5 and XML content',
      node: {
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
      },
      expectedValid: true
    });
  });

  describe('Error Recovery and Warning Tests', () => {
    beforeEach(() => {
      validator = new HTMLValidator({
        spec: 'html6-xml',
        strictMode: true,
        allowNamespaces: true,
        customNamespaces: []
      });
    });

    createTestCase(validator, {
      name: 'should emit warnings for suspicious patterns',
      node: {
        type: 'Element',
        name: 'div',
        attributes: {
          'onclick': 'alert("test")',
          'onunknown': 'test()'
        },
        children: []
      },
      expectedValid: true,
      expectedWarnings: ['W001']
    });

    createTestCase(validator, {
      name: 'should accumulate multiple errors',
      node: {
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
      },
      expectedValid: false,
      expectedErrors: ['E005', 'E007', 'E002']
    });
  });
});