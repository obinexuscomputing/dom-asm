import { Parser, ParserError } from "../src";

describe("Parser with Error Handler", () => {
  it("should invoke custom error handler for unmatched end tags", () => {
    const input = `
      <div>
        <span>Hello</span>
        </mismatch>
      </div>
    `;
    const parser = new Parser({ throwOnError: false });
    const mockErrorHandler = jest.fn();
    parser.setErrorHandler(mockErrorHandler);
    const ast = parser.parse(input);
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
    const parser = new Parser({ throwOnError: false });
    const ast = parser.parse(input);

    // Validate root node
    const divNode = ast.children?.[0];
    expect(divNode?.name).toBe("div");
    expect(divNode?.children?.length).toBe(1); // Only one valid child

    // Validate the valid child
    const spanNode = divNode?.children?.[0];
    expect(spanNode?.name).toBe("span");
  });
});
