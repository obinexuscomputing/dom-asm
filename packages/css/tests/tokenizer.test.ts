import { Tokenizer, Token } from "../src/tokenizer";

describe("Tokenizer", () => {
  test("should tokenize a simple CSS rule", () => {
    const css = "body { color: black; }";
    const tokenizer = new Tokenizer(css);
    const tokens: Token[] = tokenizer.tokenize();

    expect(tokens).toEqual([
      { type: "other", value: "body", position: { line: 1, column: 5 } },
      { type: "delimiter", value: "{", position: { line: 1, column: 7 } },
      { type: "other", value: "color", position: { line: 1, column: 13 } },
      { type: "delimiter", value: ":", position: { line: 1, column: 14 } },
      { type: "other", value: "black", position: { line: 1, column: 20 } },
      { type: "delimiter", value: ";", position: { line: 1, column: 21 } },
      { type: "delimiter", value: "}", position: { line: 1, column: 23 } },
    ]);
  });
});
