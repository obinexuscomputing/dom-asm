import { HTMLTokenizer, HTMLToken } from '../src/tokenizer/HTMLTokenizer';
import { HTMLParser, HTMLAST, HTMLASTNode } from '../src/parser/HTMLParser';

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

describe('HTMLParser', () => {
  let parser: HTMLParser;

  beforeEach(() => {
    parser = new HTMLParser();
  });

  describe('Basic Parsing', () => {
    test('should parse simple HTML', () => {
      const html = '<div>Hello World</div>';
      const ast = parser.parse(html);
      
      expect(ast.root.type).toBe('Element');
      expect(ast.root.children[0].type).toBe('Element');
      expect(ast.root.children[0].name).toBe('div');
      expect(ast.root.children[0].children[0].type).toBe('Text');
      expect(ast.root.children[0].children[0].value).toBe('Hello World');
    });

    test('should handle nested elements', () => {
      const html = '<div><p>Text</p></div>';
      const ast = parser.parse(html);
      
      const divNode = ast.root.children[0];
      expect(divNode.name).toBe('div');
      expect(divNode.children[0].name).toBe('p');
      expect(divNode.children[0].children[0].value).toBe('Text');
    });
  });

  describe('AST Optimization', () => {
    test('should merge adjacent text nodes', () => {
      const html = '<div>Hello World</div>';
      const ast = parser.parse(html);
      
      const textNodes = countTextNodes(ast.root);
      expect(textNodes).toBe(1);
    });

    test('should remove empty text nodes', () => {
      const html = '<div>  \n  <p>Text</p>  \n  </div>';
      const ast = parser.parse(html);
      
      const textNodes = countTextNodes(ast.root);
      expect(textNodes).toBe(1);
    });

    test('should optimize attributes', () => {
      const html = '<div Class="test" ID="main">Text</div>';
      const ast = parser.parse(html);
      
      const divNode = ast.root.children[0];
      expect(divNode.attributes?.get('class')).toBe('test');
      expect(divNode.attributes?.get('id')).toBe('main');
    });
  });

  describe('State Minimization', () => {
    test('should properly minimize states', () => {
      const html = '<div><p>Text</p><p>More</p></div>';
      const ast = parser.parse(html);
      
      expect(ast.metadata.minimizationMetrics).toBeDefined();
      expect(ast.metadata.minimizationMetrics!.optimizationRatio).toBeLessThanOrEqual(1);
    });

    test('should maintain correct structure after minimization', () => {
      const html = '<div><p>One</p><p>Two</p></div>';
      const ast = parser.parse(html);
      
      const divNode = ast.root.children[0];
      expect(divNode.children).toHaveLength(2);
      expect(divNode.children[0].name).toBe('p');
      expect(divNode.children[1].name).toBe('p');
    });
  });

  describe('Error Recovery', () => {
    test('should handle unclosed tags gracefully', () => {
      const html = '<div><p>Text</div>';
      expect(() => parser.parse(html)).not.toThrow();
    });

    test('should handle mismatched tags', () => {
      const html = '<div><p>Text</div></p>';
      const ast = parser.parse(html);
      
      // Should still create a valid AST
      expect(ast.root).toBeDefined();
      expect(ast.root.children).toBeDefined();
    });
  });

  describe('Metadata', () => {
    test('should compute correct node counts', () => {
      const html = '<div>Text<!-- Comment --><p>More</p></div>';
      const ast = parser.parse(html);
      
      expect(ast.metadata.elementCount).toBe(3); // root, div, p
      expect(ast.metadata.textCount).toBe(2);
      expect(ast.metadata.commentCount).toBe(1);
    });
  });
});

// Helper function to count text nodes in AST
function countTextNodes(node: HTMLASTNode): number {
  let count = 0;
  if (node.type === 'Text') count++;
  node.children.forEach(child => {
    count += countTextNodes(child);
  });
  return count;
}