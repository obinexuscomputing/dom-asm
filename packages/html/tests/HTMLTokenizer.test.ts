import { HTMLTokenizer } from "./HTMLTokenizer";

describe("HTMLTokenizer", () => {
  it("should tokenize a basic HTML element with text content", () => {
    const input = "<div>Hello World</div>";
    const tokenizer = new HTMLTokenizer(input);
    const tokens = tokenizer.tokenize();
    expect(tokens).toEqual([
      { type: "StartTag", name: "div", attributes: {}, selfClosing: false, line: 1, column: 1 },
      { type: "Text", value: "Hello World", line: 1, column: 6 },
      { type: "EndTag", name: "div", line: 1, column: 17 },
    ]);
  });

  it("should tokenize self-closing tags", () => {
    const input = "<img src='image.png' />";
    const tokenizer = new HTMLTokenizer(input);
    const tokens = tokenizer.tokenize();
    expect(tokens).toEqual([
      {
        type: "StartTag",
        name: "img",
        attributes: { src: "image.png" },
        selfClosing: true,
        line: 1,
        column: 1,
      },
    ]);
  });

  it("should handle comments", () => {
    const input = "<!-- This is a comment -->";
    const tokenizer = new HTMLTokenizer(input);
    const tokens = tokenizer.tokenize();
    expect(tokens).toEqual([
      { type: "Comment", value: "This is a comment", line: 1, column: 1 },
    ]);
  });

  it("should tokenize nested elements", () => {
    const input = "<div><span>Nested</span></div>";
    const tokenizer = new HTMLTokenizer(input);
    const tokens = tokenizer.tokenize();
    expect(tokens).toEqual([
      { type: "StartTag", name: "div", attributes: {}, selfClosing: false, line: 1, column: 1 },
      { type: "StartTag", name: "span", attributes: {}, selfClosing: false, line: 1, column: 6 },
      { type: "Text", value: "Nested", line: 1, column: 12 },
      { type: "EndTag", name: "span", line: 1, column: 19 },
      { type: "EndTag", name: "div", line: 1, column: 26 },
    ]);
  });

  it("should handle boolean attributes", () => {
    const input = "<input disabled />";
    const tokenizer = new HTMLTokenizer(input);
    const tokens = tokenizer.tokenize();
    expect(tokens).toEqual([
      {
        type: "StartTag",
        name: "input",
        attributes: { disabled: "true" },
        selfClosing: true,
        line: 1,
        column: 1,
      },
    ]);
  });

  it("should handle malformed HTML gracefully", () => {
    const input = "<div><span>Malformed</div>";
    const tokenizer = new HTMLTokenizer(input);
    const tokens = tokenizer.tokenize();
    expect(tokens).toEqual([
      { type: "StartTag", name: "div", attributes: {}, selfClosing: false, line: 1, column: 1 },
      { type: "StartTag", name: "span", attributes: {}, selfClosing: false, line: 1, column: 6 },
      { type: "Text", value: "Malformed", line: 1, column: 13 },
      { type: "EndTag", name: "div", line: 1, column: 23 },
    ]);
  });

  it("should handle empty input", () => {
    const input = "";
    const tokenizer = new HTMLTokenizer(input);
    const tokens = tokenizer.tokenize();
    expect(tokens).toEqual([]);
  });
});
