import { DOMXMLTokenizer } from '../src/tokenizer';

describe('DOMXMLTokenizer', () => {
  let tokenizer: DOMXMLTokenizer;

  describe('Basic XML Parsing', () => {
    test('should tokenize simple element', () => {
      tokenizer = new DOMXMLTokenizer('<root>Hello</root>');
      const tokens = tokenizer.tokenize();
      
      expect(tokens).toHaveLength(3); // StartTag, Text, EndTag
      expect(tokens).toEqual([
        {
          type: 'StartTag',
          name: 'root',
          attributes: {},
          selfClosing: false,
          location: { line: 1, column: 1 }
        },
        {
          type: 'Text',
          value: 'Hello',
          location: { line: 1, column: 6 }
        },
        {
          type: 'EndTag',
          name: 'root',
          location: { line: 1, column: 11 }
        }
      ]);
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
      
      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toEqual({
        type: 'StartTag',
        name: 'div',
        attributes: {
          id: 'main',
          class: 'container'
        },
        selfClosing: false,
        location: { line: 1, column: 1 }
      });
    });
  });

  describe('Special Cases', () => {
    test('should handle comments', () => {
      tokenizer = new DOMXMLTokenizer('<!-- Test comment -->');
      const tokens = tokenizer.tokenize();
      
      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toEqual({
        type: 'Comment',
        value: 'Test comment',
        location: { line: 1, column: 1 }
      });
    });

    test('should handle doctype declarations', () => {
      tokenizer = new DOMXMLTokenizer('<!DOCTYPE html>');
      const tokens = tokenizer.tokenize();
      
      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toEqual({
        type: 'Doctype',
        value: 'html',
        location: { line: 1, column: 1 }
      });
    });

    test('should handle namespaces', () => {
      tokenizer = new DOMXMLTokenizer('<ns:element xmlns:ns="http://example.com">');
      const tokens = tokenizer.tokenize();
      
      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toEqual({
        type: 'StartTag',
        name: 'ns:element',
        attributes: {
          'xmlns:ns': 'http://example.com'
        },
        selfClosing: false,
        location: { line: 1, column: 1 }
      });
    });

    test('should handle mixed content', () => {
      tokenizer = new DOMXMLTokenizer('<root>Text<child/>More text</root>');
      const tokens = tokenizer.tokenize();
      
      expect(tokens).toHaveLength(5);
      expect(tokens.map(t => t.type)).toEqual([
        'StartTag',
        'Text',
        'StartTag',
        'Text',
        'EndTag'
      ]);
    });
  });

  describe('Error Cases', () => {
    test('should handle malformed XML gracefully', () => {
      tokenizer = new DOMXMLTokenizer('<root><unclosed>');
      const tokens = tokenizer.tokenize();
      
      expect(tokens).toHaveLength(2);
      expect(tokens.map(t => t.type)).toEqual(['StartTag', 'StartTag']);
      expect(tokens[1].name).toBe('unclosed');
    });

    test('should handle empty input', () => {
      tokenizer = new DOMXMLTokenizer('');
      const tokens = tokenizer.tokenize();
      
      expect(tokens).toHaveLength(0);
    });
  });
});
