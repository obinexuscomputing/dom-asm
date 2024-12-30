import { HTMLTokenizer, HTMLToken } from '../src/tokenizer/HTMLTokenizer';

describe('HTMLTokenizer', () => {
  let tokenizer: HTMLTokenizer;

  beforeEach(() => {
    tokenizer = new HTMLTokenizer('');
  });

  describe('Basic HTML Tokenization', () => {
    test('should tokenize simple text', () => {
      tokenizer = new HTMLTokenizer('Hello World');
      const { tokens, errors } = tokenizer.tokenize();
      
      expect(errors).toHaveLength(0);
      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toMatchObject({
        type: 'Text',
        value: 'Hello World',
        isWhitespace: false
      });
    });

    test('should tokenize basic HTML tag', () => {
      tokenizer = new HTMLTokenizer('<div>Hello</div>');
      const { tokens, errors } = tokenizer.tokenize();
      
      expect(errors).toHaveLength(0);
      expect(tokens).toHaveLength(3);
      expect(tokens[0]).toMatchObject({
        type: 'StartTag',
        name: 'div',
        selfClosing: false
      });
      expect(tokens[1]).toMatchObject({
        type: 'Text',
        value: 'Hello'
      });
      expect(tokens[2]).toMatchObject({
        type: 'EndTag',
        name: 'div'
      });
    });

    test('should handle self-closing tags', () => {
      tokenizer = new HTMLTokenizer('<img src="test.jpg" />');
      const { tokens, errors } = tokenizer.tokenize();
      
      expect(errors).toHaveLength(0);
      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toMatchObject({
        type: 'StartTag',
        name: 'img',
        selfClosing: true,
        attributes: new Map([['src', 'test.jpg']])
      });
    });
  });

  describe('Attribute Handling', () => {
    test('should parse attributes correctly', () => {
      tokenizer = new HTMLTokenizer('<div class="test" id=\'main\' data-test=value>');
      const { tokens, errors } = tokenizer.tokenize();
      
      expect(errors).toHaveLength(0);
      expect(tokens[0].type).toBe('StartTag');
      expect(tokens[0].attributes).toEqual(
        new Map([
          ['class', 'test'],
          ['id', 'main'],
          ['data-test', 'value']
        ])
      );
    });

    test('should handle boolean attributes', () => {
      tokenizer = new HTMLTokenizer('<input disabled required>');
      const { tokens } = tokenizer.tokenize();
      
      expect(tokens[0].attributes).toEqual(
        new Map([
          ['disabled', 'disabled'],
          ['required', 'required']
        ])
      );
    });
  });

  describe('Special Elements', () => {
    test('should handle comments', () => {
      tokenizer = new HTMLTokenizer('<!-- Test Comment -->');
      const { tokens } = tokenizer.tokenize();
      
      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toMatchObject({
        type: 'Comment',
        value: 'Test Comment',
        isConditional: false
      });
    });

    test('should handle conditional comments', () => {
      tokenizer = new HTMLTokenizer('<!--[if IE]>Test<![endif]-->');
      const { tokens } = tokenizer.tokenize();
      
      expect(tokens[0]).toMatchObject({
        type: 'Comment',
        isConditional: true
      });
    });

    test('should handle doctype', () => {
      tokenizer = new HTMLTokenizer('<!DOCTYPE html>');
      const { tokens } = tokenizer.tokenize();
      
      expect(tokens[0]).toMatchObject({
        type: 'Doctype',
        value: 'html'
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle unclosed tags', () => {
      tokenizer = new HTMLTokenizer('<div>Test');
      const { tokens, errors } = tokenizer.tokenize();
      
      expect(errors).toHaveLength(1);
      expect(tokens).toHaveLength(2);
    });

    test('should handle malformed attributes', () => {
      tokenizer = new HTMLTokenizer('<div class="test id="main">');
      const { errors } = tokenizer.tokenize();
      
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});
