import { DOMXMLTokenizer } from '../src/tokenizer';
import { DOMXMLParser } from '../src/parser/DOMXMLParser';
import { DOMXMLASTOptimizer } from '../src/ast/DOMXMLASTOptimizer';
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

    const optimizer = new DOMXMLASTOptimizer();
    const optimizedAst = optimizer.optimize(ast);

    const validator = new DOMXMLValidator({
      schema: {
        elements: {
          parent: { children: ["child"] },
          child: { attributes: [] },
        },
      },
    });

    const validationResult = validator.validate(optimizedAst);
    expect(validationResult.valid).toBe(true);
  });
});
