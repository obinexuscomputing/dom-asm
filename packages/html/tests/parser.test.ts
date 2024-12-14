import { Parser, ParserError } from "../src"

describe("Parser with Error Handler", () => {
  it("should invoke custom error handler for unmatched end tags", () => {
    const input = `
      <div>
        <span>Hello</span>
        </mismatch>
      </div>
    `;
    const parser = new Parser();
    const mockErrorHandler = jest.fn();

    parser.setErrorHandler(mockErrorHandler);
    parser.parse(input);

    expect(mockErrorHandler).toHaveBeenCalled();
    expect(mockErrorHandler.mock.calls[0][0]).toBeInstanceOf(ParserError);
  });

  it("should recover and continue parsing after an error", () => {
    const input = `
      <div>
        <span>Hello</span>
        </mismatch>
      </div>
    `;
    const parser = new Parser();
    const { ast } = parser.parse(input);

    // AST should still contain the root <div> and its valid children
    expect(ast.children[0].name).toBe("div");
    expect(ast.children[0].children[0].name).toBe("span");
  });
});
