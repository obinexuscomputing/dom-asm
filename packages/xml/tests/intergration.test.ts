import { DOMXMLTokenizer } from '../src/tokenizer';
import { DOMXMLParser } from '../src/parser/DOMXMLParser';
import { DOMXMLOptimizer } from '../src/optimizer';
import { DOMXMLValidator } from '../src/validator';

describe('DOMXML Integration', () => {
  test('should handle complete XML workflow', () => {
    const input = `
      <root>
        <!-- Comment -->
        <parent>
          <child>Test</child>
        </parent>
      </root>
    `;

    const tokenizer = new DOMXMLTokenizer(input);
    const tokens = tokenizer.tokenize();
    
    const parser = new DOMXMLParser(tokens);
    const ast = parser.parse();

    expect(ast.metadata?.elementCount).toBe(3); // root, parent, child
    expect(ast.metadata?.textCount).toBe(1);
    expect(ast.metadata?.commentCount).toBe(1);
  });

  test('should optimize AST', () => {
    const input = `
      <root>
        <div>  </div>
        <div>Test1</div>
        <div>Test2</div>
      </root>
    `;

    const tokenizer = new DOMXMLTokenizer(input);
    const parser = new DOMXMLParser(tokenizer.tokenize());
    const ast = parser.parse();
    
    const optimizer = new DOMXMLOptimizer();
    const optimizedAst = optimizer.optimize(ast);

    // Empty div should be removed or optimized
    expect(optimizedAst.metadata?.elementCount).toBeLessThan(ast.metadata?.elementCount!);
  });

  test('should validate XML', () => {
    const input = '<root><item required="true" /></root>';
    
    const tokenizer = new DOMXMLTokenizer(input);
    const parser = new DOMXMLParser(tokenizer.tokenize());
    const ast = parser.parse();
    
    const validator = new DOMXMLValidator({
      schema: {
        elements: {
          item: {
            attributes: ['required'],
            required: ['required']
          }
        }
      }
    });

    const result = validator.validate(ast);
    expect(result.valid).toBe(true);
  });

  test('should handle errors gracefully', () => {
    const input = '<root><unclosed>';
    
    const tokenizer = new DOMXMLTokenizer(input);
    const parser = new DOMXMLParser(tokenizer.tokenize());
    
    expect(() => parser.parse()).toThrow('Unclosed tag');
  });
});