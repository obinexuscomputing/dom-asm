import { DOMXMLTokenizer } from '../src/tokenizer';

describe('DOMXMLTokenizer', () => {
  let tokenizer: DOMXMLTokenizer;

  describe('Basic XML Parsing', () => {
    test('should tokenize simple element', () => {
      tokenizer = new DOMXMLTokenizer('<root>Hello</root>');
      const tokens = tokenizer.tokenize();
      
      expect(tokens).toHaveLength(3);
      expect(tokens[0]).toEqual({
        type: 'StartTag',
        name: 'root',
        attributes: {},
        selfClosing: false,
        location: { line: 1, column: 1 }
      });
    });

    test('should handle self-closing tags', () => {
      tokenizer = new DOMXMLTokenizer('<img src="test.jpg" />');
      const tokens = tokenizer.tokenize();
      
      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toEqual({
        type: 'StartTag',
        name: 'img',
        attributes: { src: 'test.jpg' },
        selfClosing: true,
        location: { line: 1, column: 1 }
      });
    });

    test('should parse attributes correctly', () => {
      tokenizer = new DOMXMLTokenizer('<div id="main" class="container">');
      const tokens = tokenizer.tokenize();
      
      expect(tokens[0].attributes).toEqual({
        id: 'main',
        class: 'container'
      });
    });
  });

  describe('Special Cases', () => {
    test('should handle comments', () => {
      tokenizer = new DOMXMLTokenizer('<!-- Test comment -->');
      const tokens = tokenizer.tokenize();
      
      expect(tokens[0]).toEqual({
        type: 'Comment',
        value: 'Test comment',
        location: { line: 1, column: 1 }
      });
    });

    test('should handle doctype declarations', () => {
      tokenizer = new DOMXMLTokenizer('<!DOCTYPE html>');
      const tokens = tokenizer.tokenize();
      
      expect(tokens[0]).toEqual({
        type: 'Doctype',
        value: 'html',
        location: { line: 1, column: 1 }
      });
    });

    test('should handle namespaces', () => {
      tokenizer = new DOMXMLTokenizer('<ns:element xmlns:ns="http://example.com">');
      const tokens = tokenizer.tokenize();
      
      expect(tokens[0].name).toBe('ns:element');
      expect(tokens[0].attributes?.['xmlns:ns']).toBe('http://example.com');
    });
  });

  describe('Error Cases', () => {
    test('should handle malformed XML gracefully', () => {
      tokenizer = new DOMXMLTokenizer('<root><unclosed>');
      const tokens = tokenizer.tokenize();
      
      expect(tokens).toHaveLength(2);
      expect(tokens[1].type).toBe('StartTag');
      expect(tokens[1].name).toBe('unclosed');
    });
  });
});