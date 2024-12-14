import { Optimizer } from "../src/optimizer";
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

    const optimizer = new Optimizer(ast);
    const optimizedAST = optimizer.optimize();

    expect(optimizedAST.children[0].children.length).toBe(2); // selector + 1 declaration
  });
});
