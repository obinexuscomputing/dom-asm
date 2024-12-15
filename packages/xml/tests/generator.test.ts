import { DOMXMLGenerator } from '../src/generator/DOMXMLGenerator';
import { DOMXMLAST } from '../src/ast';

describe('DOMXMLGenerator', () => {
  let generator: DOMXMLGenerator;

  beforeEach(() => {
    generator = new DOMXMLGenerator({ prettyPrint: true });
  });

  test('should generate simple XML', () => {
    const ast: DOMXMLAST = {
      root: {
        type: 'Element',
        name: 'root',
        children: [
          {
            type: 'Element',
            name: 'child',
            children: [
              {
                type: 'Text',
                value: 'Test'
              }
            ]
          }
        ]
      }
    };

    const xml = generator.generate(ast);
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<root>');
    expect(xml).toContain('  <child>Test</child>');
    expect(xml).toContain('</root>');
  });

  test('should handle attributes', () => {
    const ast: DOMXMLAST = {
      root: {
        type: 'Element',
        name: 'root',
        attributes: { id: 'main' },
        children: []
      }
    };

    const xml = generator.generate(ast);
    expect(xml).toContain('<root id="main"/>');
  });

  test('should escape special characters', () => {
    const ast: DOMXMLAST = {
      root: {
        type: 'Element',
        name: 'root',
        children: [
          {
            type: 'Text',
            value: '< & >'
          }
        ]
      }
    };

    const xml = generator.generate(ast);
    expect(xml).toContain('&lt; &amp; &gt;');
  });
});