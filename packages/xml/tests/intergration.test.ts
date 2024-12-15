import { DOMXML } from '../src';

describe('DOMXML Integration', () => {
  let xml: DOMXML;

  beforeEach(() => {
    xml = new DOMXML({ validateOnParse: true });
  });

  test('should handle complete XML workflow', () => {
    const input = `
      <?xml version="1.0" encoding="UTF-8"?>
      <root>
        <!-- Test comment -->
        <item id="1">
          <name>Test Item</name>
          <value>123</value>
        </item>
      </root>
    `;

    const ast = xml.parse(input);
    expect(ast.metadata?.elementCount).toBe(4); // root, item, name, value
    expect(ast.metadata?.commentCount).toBe(1);

    const output = xml.generate(ast);
    expect(output).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(output).toContain('<item id="1">');
    expect(output).toContain('<name>Test Item</name>');
  });

  test('should optimize AST', () => {
    const input = `
      <root>
        <div></div>
        <div></div>
        <text>  </text>
      </root>
    `;

    const ast = xml.parse(input);
    const optimized = xml.optimize(ast);
    expect(optimized.metadata?.elementCount).toBeLessThan(ast.metadata?.elementCount!);
  });

  test('should validate XML', () => {
    const input = '<root><valid>test</valid></root>';
    const ast = xml.parse(input);
    const result = xml.validate(ast);
    expect(result.valid).toBe(true);
  });

  test('should handle errors gracefully', () => {
    const input = '<root><invalid></valid></root>';
    expect(() => xml.parse(input)).toThrow();
  });
});