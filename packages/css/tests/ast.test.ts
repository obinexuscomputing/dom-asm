import { Tokenizer } from "../src/tokenizer";
import { ASTBuilder } from "../src/ast";

describe("ASTBuilder", () => {
  test("should build a valid AST for a simple rule", () => {
    const css = "body { color: black; }";
    const tokenizer = new Tokenizer(css);
    const tokens = tokenizer.tokenize();
    const astBuilder = new ASTBuilder(tokens);
    const ast = astBuilder.buildAST();

    expect(ast).toEqual({
      type: "stylesheet",
      children: [
        {
          type: "rule",
          children: [
            { type: "selector", value: "body", children: [] },
            {
              type: "declaration",
              children: [
                { type: "property", value: "color", children: [] },
                { type: "value", value: "black", children: [] },
              ],
            },
          ],
        },
      ],
    });
  });
});
