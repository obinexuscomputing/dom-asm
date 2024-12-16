import { HTMLValidator, HTMLValidationResult } from '../src/validator/HTMLValidator';
import { HTMLASTNode } from '../src/ast/HTMLAST';

// Define interface for validator options
interface ValidatorOptions {
  spec?: 'html5' | 'html6-xml';
  strictMode?: boolean;
  allowCustomElements?: boolean;
  allowNamespaces?: boolean;
  customNamespaces?: string[];
}

describe('HTMLValidator', () => {
  // Helper function with proper typing
  function createValidatorTestCase(
    options: ValidatorOptions,
    config: {
      name: string;
      node: HTMLASTNode;
      expectedValid: boolean;
      expectedErrors?: string[];
      expectedWarnings?: string[];
    }
  ): void {
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
    const baseOptions: ValidatorOptions = {
      strictMode: false,
      allowCustomElements: false
    };

    describe('Basic Structure Tests', () => {
      createValidatorTestCase(baseOptions, {
        name: 'should validate empty element nodes',
        node: {
          type: 'Element',
          name: 'div',
          children: []
        },
        expectedValid: true
      });

      createValidatorTestCase(baseOptions, {
        name: 'should reject elements without names',
        node: {
          type: 'Element',
          children: []
        },
        expectedValid: false,
        expectedErrors: ['E001']
      });
    });

    describe('Content Model Tests', () => {
      createValidatorTestCase(baseOptions, {
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

      createValidatorTestCase(baseOptions, {
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
  });

  describe('HTML5 Specific Tests', () => {
    const html5Options: ValidatorOptions = {
      spec: 'html5',
      strictMode: true
    };

    createValidatorTestCase(html5Options, {
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
  });

  describe('HTML6-XML Tests', () => {
    const xmlOptions: ValidatorOptions = {
      spec: 'html6-xml',
      allowNamespaces: true,
      customNamespaces: ['html', 'custom']
    };

    createValidatorTestCase(xmlOptions, {
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

    createValidatorTestCase(xmlOptions, {
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

  describe('Error Recovery and Warning Tests', () => {
    const warningTestOptions: ValidatorOptions = {
      spec: 'html6-xml',
      strictMode: true,
      allowNamespaces: true,
      customNamespaces: []
    };

    createValidatorTestCase(warningTestOptions, {
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

    createValidatorTestCase(warningTestOptions, {
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