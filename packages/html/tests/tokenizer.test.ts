import { HTMLTokenizer } from "../src/tokenizer/";
import { Parser,ParserError } from "../src/parser/";

describe("Parser with Custom Errors", () => {
  it("should throw ParserError for unmatched end tags", () => {
    const input = `
      <div>
        <span>Hello</span>
      </span>
    `;

    const parser = new Parser();
    const tokens = new HTMLTokenizer(input).tokenize();

    expect(() => parser.parse(input)).toThrow(ParserError);
  });

  it("should continue parsing after encountering an error", () => {
    const input = `
      <div>
        <span>Hello</span>
        </unmatched>
      </div>
    `;

    const parser = new Parser();
    const tokens = new HTMLTokenizer(input).tokenize();
    const ast = parser.parse(input);

    expect(ast.children).toHaveLength(1); // The root <div> should still be parsed
  });
});
