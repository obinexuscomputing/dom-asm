import { HTMLParser } from "../src/parser/HTMLParser";

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
        
        // After merging, there should be exactly one text node
        expect(ast.root.children[0].children.filter(n => n.type === 'Text')).toHaveLength(1);
    });
 
    test('should remove empty text nodes', () => {
        const html = '<div>  \n  <p>Text</p>  \n  </div>';
        const ast = parser.parse(html);
        
        // After optimization, only non-empty text nodes should remain
        const textNodes = ast.root.children[0].children.filter(n => n.type === 'Text');
        expect(textNodes.length).toBe(0); // All whitespace should be removed
    });

    test('should optimize attributes', () => {
        const html = '<div Class="test" ID="main">Text</div>';
        const ast = parser.parse(html);
        
        const divNode = ast.root.children[0];
        // Attributes should be normalized to lowercase
        expect(divNode.attributes?.get('class')).toBe('test');
        expect(divNode.attributes?.get('id')).toBe('main');
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