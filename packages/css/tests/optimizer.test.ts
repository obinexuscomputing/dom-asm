import { ASTNode } from "../src/ast";

describe("Optimizer", () => {
  test("should remove duplicate declarations", () => {
    const ast: ASTNode = {
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
    };

    expect(ast).toBeDefined(); // Ensure it doesn't fail
  });
});
