import { CodeGenerator } from "../src/generator";
import { ASTNode } from "../src/ast";

describe("CodeGenerator", () => {
  test("should generate CSS from a valid AST", () => {
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

    const generator = new CodeGenerator(ast);
    const cssOutput = generator.generate();

    expect(cssOutput).toBe("body {\n  color: black;\n}");
  });
});
