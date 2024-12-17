// tests/parser.test.ts
import { DOMXMLParser } from '../src/parser/DOMXMLParser';
import { DOMXMLTokenizer } from '../src/tokenizer';
describe('DOMXMLParser', () => {
    let parser;
    let tokenizer;
    describe('Basic Parsing', () => {
        test('should parse simple XML', () => {
            tokenizer = new DOMXMLTokenizer('<root><child>Test</child></root>');
            parser = new DOMXMLParser(tokenizer.tokenize());
            const ast = parser.parse();
            expect(ast.root).toBeDefined();
            expect(ast.root.type).toBe('Element');
            expect(ast.root.name).toBe('root');
            expect(ast.root.children).toHaveLength(1);
            expect(ast.root.children?.[0].type).toBe('Element');
            expect(ast.root.children?.[0].children?.[0].type).toBe('Text');
            expect(ast.root.children?.[0].children?.[0].value).toBe('Test');
        });
        test('should handle nested elements', () => {
            tokenizer = new DOMXMLTokenizer(`
        <root>
          <parent>
            <child>Test</child>
          </parent>
        </root>
      `);
            parser = new DOMXMLParser(tokenizer.tokenize());
            const ast = parser.parse();
            expect(ast.metadata?.elementCount).toBe(3);
            expect(ast.metadata?.textCount).toBe(1);
            expect(ast.root.children?.[0].type).toBe('Element');
            expect(ast.root.children?.[0].name).toBe('parent');
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
            parser = new DOMXMLParser(tokenizer.tokenize());
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
            parser = new DOMXMLParser(tokenizer.tokenize());
            expect(() => parser.parse()).toThrow(/mismatched tags/i);
        });
        test('should throw on unclosed tags', () => {
            tokenizer = new DOMXMLTokenizer('<root><child>');
            parser = new DOMXMLParser(tokenizer.tokenize());
            expect(() => parser.parse()).toThrow(/unclosed tag/i);
        });
    });
});
//# sourceMappingURL=parser.test.js.map