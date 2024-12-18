import { JSAstGenerator } from "../src/ast/JavaScriptAstCodeGenerator";
import { TypedJSASTNode, NodeType } from "../src/types";

describe("JSAstGenerator", () => {
  let generator: JSAstGenerator;

  beforeEach(() => {
    generator = new JSAstGenerator();
  });

  it("should generate code for a variable declaration", () => {
    const ast: TypedJSASTNode = {
      type: NodeType.Program,
      children: [
        {
          type: NodeType.VariableDeclaration,
          value: "const",
          children: [
            { type: NodeType.Identifier, value: "x" },
            { type: NodeType.Literal, value: "42" },
          ],
        },
      ],
    };

    const result = generator.generateFromAST(ast);
    expect(result.success).toBe(true);
    expect(result.code).toBe("const x = 42;");
  });

  it("should generate code for an if statement", () => {
    const ast: TypedJSASTNode = {
      type: NodeType.Program,
      children: [
        {
          type: NodeType.IfStatement,
          children: [
            {
              type: NodeType.BinaryExpression,
              value: "==",
              children: [
                { type: NodeType.Identifier, value: "x" },
                { type: NodeType.Literal, value: "42" },
              ],
            },
            {
              type: NodeType.BlockStatement,
              children: [
                { type: NodeType.Identifier, value: "doSomething" },
              ],
            },
          ],
        },
      ],
    };

    const result = generator.generateFromAST(ast);
    expect(result.success).toBe(true);
    expect(result.code).toBe("if (x == 42) {\n  doSomething;\n}");
  });

  it("should generate code for a function declaration", () => {
    const ast: TypedJSASTNode = {
      type: NodeType.Program,
      children: [
        {
          type: NodeType.FunctionDeclaration,
          value: "myFunc",
          children: [
            { type: NodeType.Identifier, value: "arg1" },
            { type: NodeType.Identifier, value: "arg2" },
            {
              type: NodeType.BlockStatement,
              children: [
                {
                  type: NodeType.ReturnStatement,
                  children: [
                    {
                      type: NodeType.BinaryExpression,
                      value: "+",
                      children: [
                        { type: NodeType.Identifier, value: "arg1" },
                        { type: NodeType.Identifier, value: "arg2" },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };

    const result = generator.generateFromAST(ast);
    expect(result.success).toBe(true);
    expect(result.code).toBe(
      "function myFunc(arg1, arg2) {\n  return arg1 + arg2;\n}"
    );
  });

  it("should throw an error for invalid AST", () => {
    const invalidAst: TypedJSASTNode = {
      type: NodeType.Program,
      children: [
        {
          type: NodeType.VariableDeclaration,
          value: "const",
          children: [], // Missing children
        },
      ],
    };

    const result = generator.generateFromAST(invalidAst);
    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.errors?.length).toBeGreaterThan(0);
  });

  it("should format code in compact mode", () => {
    const ast: TypedJSASTNode = {
      type: NodeType.Program,
      children: [
        {
          type: NodeType.VariableDeclaration,
          value: "const",
          children: [
            { type: NodeType.Identifier, value: "x" },
            { type: NodeType.Literal, value: "42" },
          ],
        },
      ],
    };

    const result = generator.generateFromAST(ast, { format: "compact" });
    expect(result.success).toBe(true);
    expect(result.code).toBe("const x=42;");
  });

  it("should respect custom indentation", () => {
    const ast: TypedJSASTNode = {
      type: NodeType.Program,
      children: [
        {
          type: NodeType.FunctionDeclaration,
          value: "myFunc",
          children: [
            { type: NodeType.Identifier, value: "arg1" },
            { type: NodeType.Identifier, value: "arg2" },
            {
              type: NodeType.BlockStatement,
              children: [
                {
                  type: NodeType.ReturnStatement,
                  children: [
                    {
                      type: NodeType.BinaryExpression,
                      value: "+",
                      children: [
                        { type: NodeType.Identifier, value: "arg1" },
                        { type: NodeType.Identifier, value: "arg2" },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };

    const result = generator.generateFromAST(ast, { indent: "    " });
    expect(result.success).toBe(true);
    expect(result.code).toContain("    return arg1 + arg2;");
  });

  it("should handle missing optional fields gracefully", () => {
    const ast: TypedJSASTNode = {
      type: NodeType.Program,
      children: [
        {
          type: NodeType.FunctionDeclaration,
          value: "testFunc",
          children: [
            {
              type: NodeType.BlockStatement,
              children: [],
            },
          ],
        },
      ],
    };

    const result = generator.generateFromAST(ast);
    expect(result.success).toBe(true);
    expect(result.code).toBe("function testFunc() {\n}");
  });
});
