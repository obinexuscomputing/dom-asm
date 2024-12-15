import { DOMXMLParser } from '../src/parser/DOMXMLParser';
import { DOMXMLTokenizer } from '../src/tokenizer';
import { DOMXMLAST } from '../src/ast';

describe('DOMXMLParser', () => {
  let parser: DOMXMLParser;
  let tokenizer: DOMXMLTokenizer;

  describe('Basic Parsing', () => {
    test('should parse simple XML', () => {
      tokenizer = new DOMXMLTokenizer('<root><child>Test</child></root>');
      const tokens = tokenizer.tokenize();
      parser = new DOMXMLParser(tokens);
      
      const ast = parser.parse();
      expect(ast.root.type).toBe('Element');
      expect(ast.root.children?.[0].type).toBe('Element');
      expect(ast.root.children?.[0].children?.[0].type).toBe('Text');
    });

    test('should handle nested elements', () => {
      tokenizer = new DOMXMLTokenizer(`
        <root>
          <parent>
            <child>Test</child>
          </parent>
        </root>
      `);
      const tokens = tokenizer.tokenize();
      parser = new DOMXMLParser(tokens);
      
      const ast = parser.parse();
      expect(ast.metadata?.elementCount).toBe(3); // root, parent, child
      expect(ast.metadata?.textCount).toBe(1);
    });
  });

  describe('Metadata Generation', () => {
    test('should compute correct metadata', () => {
      tokenizer = new DOMXMLTokenizer(`
        <root>
          <!-- Comment -->
          <item>Text</item>
          <item />
        </root>
      `);
      const tokens = tokenizer.tokenize();
      parser = new DOMXMLParser(tokens);
      
      const ast = parser.parse();
      expect(ast.metadata).toEqual({
        nodeCount: 5,
        elementCount: 3,
        textCount: 1,
        commentCount: 1
      });
    });
  });

  describe('Error Handling', () => {
    test('should throw on mismatched tags', () => {
      tokenizer = new DOMXMLTokenizer('<root><child></parent></root>');
      const tokens = tokenizer.tokenize();
      parser = new DOMXMLParser(tokens);
      
      expect(() => parser.parse()).toThrow('Mismatched tags');
    });

    test('should throw on unclosed tags', () => {
      tokenizer = new DOMXMLTokenizer('<root><child>');
      const tokens = tokenizer.tokenize();
      parser = new DOMXMLParser(tokens);
      
      expect(() => parser.parse()).toThrow('Unclosed tag');
    });
  });
});