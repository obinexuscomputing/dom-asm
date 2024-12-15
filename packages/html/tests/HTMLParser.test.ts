import { HTMLParser, HTMLParserError } from "../src";

describe("Parser with Custom Errors", () => {
  it("should throw HTMLParserError for unmatched end tags", () => {
    const input = `
      <div>
        <span>Hello</span>
      </span>
    `;
    const parser = new HTMLParser({ throwOnError: true });
    expect(() => parser.parse(input)).toThrow(HTMLParserError);
  });

  it("should continue parsing after encountering an error when throwOnError is false", () => {
    const input = `
      <div>
        <span>Hello</span>
        </unmatched>
      </div>
    `;
    const parser = new HTMLParser({ throwOnError: false });
    const ast = parser.parse(input);
    expect(ast.children).toHaveLength(1);
    expect(ast.children[0].name).toBe("div");
  });
});

describe("Parser with Error Handler", () => {
  it("should invoke custom error handler for unmatched end tags", () => {
    const input = `
      <div>
        <span>Hello</span>
        </mismatch>
      </div>
    `;
    const parser = new HTMLParser({ throwOnError: false });
    const mockErrorHandler = jest.fn();
    parser.setErrorHandler(mockErrorHandler);
    const ast = parser.parse(input);
    expect(mockErrorHandler).toHaveBeenCalled();
    expect(mockErrorHandler.mock.calls[0][0]).toBeInstanceOf(HTMLParserError);
  });

  it("should recover and continue parsing after an error", () => {
    const input = `
      <div>
        <span>Hello</span>
        </mismatch>
      </div>
    `;
    const parser = new HTMLParser({ throwOnError: false });
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