import { HTMLParser ,HTMLParserError } from '../src/parser/';
describe("HTMLParser", () => {
  it("should throw HTMLParserError for unmatched end tags", () => {
    const input = `<div><span>Text</div>`;
    const parser = new HTMLParser({ throwOnError: true });

    expect(() => parser.parse(input)).toThrow(HTMLParserError);
  });

  it("should continue parsing after encountering an error when throwOnError is false", () => {
    const input = `<div><span>Text</div>`;
    const parser = new HTMLParser({ throwOnError: false });
    const ast = parser.parse(input);

    expect(ast.root.children).toHaveLength(1);
    expect(ast.root.children[0].name).toBe("div");
  });

  it("should invoke custom error handler for unmatched end tags", () => {
    const input = `<div><span>Text</div>`;
    const parser = new HTMLParser({ throwOnError: false });
    const mockErrorHandler = jest.fn();

    parser.setErrorHandler(mockErrorHandler);
    parser.parse(input);

    expect(mockErrorHandler).toHaveBeenCalled();
    expect(mockErrorHandler.mock.calls[0][0]).toBeInstanceOf(HTMLParserError);
  });

  it("should recover and continue parsing after an error", () => {
    const input = `<div><span>Text</div>`;
    const parser = new HTMLParser({ throwOnError: false });
    const ast = parser.parse(input);

    const divNode = ast.root.children[0];
    expect(divNode.name).toBe("div");
    expect(divNode.children.length).toBe(1);

    const spanNode = divNode.children[0];
    expect(spanNode.name).toBe("span");
    expect(spanNode.children.length).toBe(1);
  });
});
