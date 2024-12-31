import { HTMLTokenizer } from '../src/tokenizer/HTMLTokenizer';

describe('HTMLTokenizer', () => {
  describe('Basic Tokenization', () => {
    it('should tokenize simple tags', () => {
      const tokenizer = new HTMLTokenizer('<div></div>');
      const { tokens, errors } = tokenizer.tokenize();
      
      expect(errors).toHaveLength(0);
      expect(tokens).toHaveLength(3); // StartTag + EndTag + EOF
      expect(tokens[0]).toMatchObject({
        type: 'StartTag',
        name: 'div',
        selfClosing: false
      });
      expect(tokens[1]).toMatchObject({
        type: 'EndTag',
        name: 'div'
      });
    });

    it('should handle self-closing tags', () => {
      const tokenizer = new HTMLTokenizer('<img src="test.jpg" />');
      const { tokens, errors } = tokenizer.tokenize();
      
      expect(errors).toHaveLength(0);
      expect(tokens).toHaveLength(2); // StartTag + EOF
      expect(tokens[0]).toMatchObject({
        type: 'StartTag',
        name: 'img',
        selfClosing: true
      });
    });
  });

  describe('Attribute Handling', () => {
    it('should parse attributes correctly', () => {
      const input = '<div class="test" id="123"></div>';
      const tokenizer = new HTMLTokenizer(input);
      const { tokens, errors } = tokenizer.tokenize();
      
      expect(errors).toHaveLength(0);
      expect(tokens[0].type).toBe('StartTag');
      expect(tokens[0].attributes).toEqual(
        new Map([
          ['class', 'test'],
          ['id', '123']
        ])
      );
    });

    it('should handle unquoted attributes', () => {
      const tokenizer = new HTMLTokenizer('<div class=test></div>');
      const { tokens, errors } = tokenizer.tokenize();
      
      expect(errors).toHaveLength(0);
      expect(tokens[0].attributes.get('class')).toBe('test');
    });

    it('should handle boolean attributes', () => {
      const tokenizer = new HTMLTokenizer('<input disabled>');
      const { tokens } = tokenizer.tokenize();
      
      expect(tokens[0].attributes.get('disabled')).toBe('');
    });
  });

  describe('Special Elements', () => {
    let tokenizer;

    beforeEach(() => {
      tokenizer = null;
    });

    test('should handle comments', () => {
      tokenizer = new HTMLTokenizer('<!-- Test Comment -->');
      const { tokens } = tokenizer.tokenize();
      
      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toMatchObject({
        type: 'Comment',
        data: 'Test Comment'
      });
    });

    test('should handle conditional comments', () => {
      tokenizer = new HTMLTokenizer('<!--[if IE]>Test<![endif]-->');
      const { tokens } = tokenizer.tokenize();
      
      expect(tokens[0]).toMatchObject({
        type: 'Comment',
        data: '[if IE]>Test<![endif]'
      });
    });

    test('should handle doctype', () => {
      tokenizer = new HTMLTokenizer('<!DOCTYPE html>');
      const { tokens } = tokenizer.tokenize();
      
      expect(tokens[0]).toMatchObject({
        type: 'Doctype',
        name: 'html'
      });
    });

    test('should handle CDATA sections', () => {
      tokenizer = new HTMLTokenizer('<![CDATA[Test Data]]>', { recognizeCDATA: true });
      const { tokens } = tokenizer.tokenize();
      
      expect(tokens[0]).toMatchObject({
        type: 'CDATA',
        content: 'Test Data'
      });
    });
  });

  describe('Text Content', () => {
    it('should handle text nodes', () => {
      const tokenizer = new HTMLTokenizer('Hello World');
      const { tokens } = tokenizer.tokenize();
      
      expect(tokens[0]).toMatchObject({
        type: 'Text',
        content: 'Hello World',
        isWhitespace: false
      });
    });

    it('should identify whitespace nodes', () => {
      const tokenizer = new HTMLTokenizer('  \n  ');
      const { tokens } = tokenizer.tokenize();
      
      expect(tokens[0]).toMatchObject({
        type: 'Text',
        isWhitespace: true
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle unclosed tags', () => {
      const input = '<div class="test">';
      const tokenizer = new HTMLTokenizer(input);
      
      const { tokens, errors } = tokenizer.tokenize();
      
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe('Unexpected end of input in tag div');
      
      expect(tokens).toHaveLength(2); // StartTag + EOF
      expect(tokens[1].type).toBe('EOF');
    });

    it('should handle invalid tag names', () => {
      const tokenizer = new HTMLTokenizer('< invalid>');
      const { errors } = tokenizer.tokenize();
      
      expect(errors.some(e => e.message.includes('Invalid start tag name'))).toBe(true);
    });

    it('should handle malformed attributes', () => {
      const tokenizer = new HTMLTokenizer('<div class="unclosed>');
      const { errors } = tokenizer.tokenize();
      
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('Advanced Features', () => {
    it('should respect preserveWhitespace option', () => {
      const input = '<div>  \n  </div>';
      const tokenizer = new HTMLTokenizer(input, { preserveWhitespace: true });
      const { tokens } = tokenizer.tokenize();
      
      const textNodes = tokens.filter(t => t.type === 'Text');
      expect(textNodes).toHaveLength(1);
    });

    it('should support XML mode', () => {
      const tokenizer = new HTMLTokenizer('<ns:tag xmlns:ns="uri" />', { xmlMode: true });
      const { tokens } = tokenizer.tokenize();
      
      expect(tokens[0].namespace).toBe('ns');
    });
  });

  describe('Position Tracking', () => {
    it('should track line and column numbers', () => {
      const input = 'Line1\n<div>Line2</div>';
      const tokenizer = new HTMLTokenizer(input);
      const { tokens } = tokenizer.tokenize();
      
      expect(tokens[0]).toMatchObject({
        type: 'Text',
        line: 1,
        column: 1
      });
      expect(tokens[1]).toMatchObject({
        type: 'StartTag',
        line: 2,
        column: 1
      });
    });

    it('should track token positions', () => {
      const input = '<div>test</div>';
      const tokenizer = new HTMLTokenizer(input);
      const { tokens } = tokenizer.tokenize();
      
      expect(tokens[0].start).toBe(0);
      expect(tokens[0].end).toBe(5);
    });
  });
});