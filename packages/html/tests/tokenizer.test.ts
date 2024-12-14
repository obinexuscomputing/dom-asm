import { Parser, ParserError } from "../src";

describe("Parser with Custom Errors", () => {
  it("should throw ParserError for unmatched end tags", () => {
    const input = `
      <div>
        <span>Hello</span>
      </span>
    `;
    const parser = new Parser({ throwOnError: true });
    expect(() => parser.parse(input)).toThrow(ParserError);
  });

  it("should continue parsing after encountering an error when throwOnError is false", () => {
    const input = `
      <div>
        <span>Hello</span>
        </unmatched>
      </div>
    `;
    const parser = new Parser({ throwOnError: false });
    const ast = parser.parse(input);
    expect(ast.children).toHaveLength(1);
    expect(ast.children[0].name).toBe("div");
  });
});