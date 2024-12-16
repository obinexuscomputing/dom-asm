import { JSParser } from "../src/parser/JSParser";
import { JSToken, JSTokenType } from "../src/types";
import { NodeType, JSASTNode } from "../src/types";

describe("JSParser", () => {
  let parser: JSParser;

  beforeEach(() => {
    parser = new JSParser();
  });
  test("should parse an empty block statement", () => {
    const tokens: JSToken[] = [
        { type: JSTokenType.Delimiter, value: "{" },
        { type: JSTokenType.Delimiter, value: "}" },
    ];

    const ast = parser.parse(tokens);

    expect(ast).toEqual({
        type: NodeType.Program,
        children: [
            {
                type: NodeType.BlockStatement,
                children: [],
            },
        ],
    });
});

  test("should parse a variable declaration", () => {
    const tokens: JSToken[] = [
      { type: JSTokenType.Keyword, value: "const" },
      { type: JSTokenType.Identifier, value: "x" },
      { type: JSTokenType.Operator, value: "=" },
      { type: JSTokenType.Literal, value: "42" },
      { type: JSTokenType.EndOfStatement, value: ";" },
    ];

    const ast = parser.parse(tokens);

    expect(ast).toEqual({
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
    });
  });

  test("should parse an if statement", () => {
    const tokens: JSToken[] = [
      { type: JSTokenType.Keyword, value: "if" },
      { type: JSTokenType.Delimiter, value: "(" },
      { type: JSTokenType.Identifier, value: "x" },
      { type: JSTokenType.Operator, value: "==" },
      { type: JSTokenType.Literal, value: "42" },
      { type: JSTokenType.Delimiter, value: ")" },
      { type: JSTokenType.Delimiter, value: "{" },
      { type: JSTokenType.Identifier, value: "doSomething" },
      { type: JSTokenType.Delimiter, value: "(" },
      { type: JSTokenType.Delimiter, value: ")" },
      { type: JSTokenType.EndOfStatement, value: ";" },
      { type: JSTokenType.Delimiter, value: "}" },
    ];

    const ast = parser.parse(tokens);

    expect(ast).toEqual({
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
                {
                  type: NodeType.Identifier,
                  value: "doSomething",
                },
              ],
            },
          ],
        },
      ],
    });
  });

  test("should parse a function declaration", () => {
    const tokens: JSToken[] = [
      { type: JSTokenType.Keyword, value: "function" },
      { type: JSTokenType.Identifier, value: "myFunc" },
      { type: JSTokenType.Delimiter, value: "(" },
      { type: JSTokenType.Identifier, value: "arg1" },
      { type: JSTokenType.Delimiter, value: "," },
      { type: JSTokenType.Identifier, value: "arg2" },
      { type: JSTokenType.Delimiter, value: ")" },
      { type: JSTokenType.Delimiter, value: "{" },
      { type: JSTokenType.Keyword, value: "return" },
      { type: JSTokenType.Identifier, value: "arg1" },
      { type: JSTokenType.Operator, value: "+" },
      { type: JSTokenType.Identifier, value: "arg2" },
      { type: JSTokenType.EndOfStatement, value: ";" },
      { type: JSTokenType.Delimiter, value: "}" },
    ];

    const ast = parser.parse(tokens);

    expect(ast).toEqual({
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
    });
  });

  test("should throw an error for missing ')' in if statement", () => {
    const tokens: JSToken[] = [
      { type: JSTokenType.Keyword, value: "if" },
      { type: JSTokenType.Delimiter, value: "(" },
      { type: JSTokenType.Identifier, value: "x" },
      { type: JSTokenType.Operator, value: "==" },
      { type: JSTokenType.Literal, value: "42" },
    ];

    expect(() => parser.parse(tokens)).toThrow("Expected ')' after condition");
  });

  test("should throw an error for unmatched '}'", () => {
    const tokens: JSToken[] = [
      { type: JSTokenType.Keyword, value: "if" },
      { type: JSTokenType.Delimiter, value: "(" },
      { type: JSTokenType.Identifier, value: "x" },
      { type: JSTokenType.Operator, value: "==" },
      { type: JSTokenType.Literal, value: "42" },
      { type: JSTokenType.Delimiter, value: ")" },
      { type: JSTokenType.Delimiter, value: "{" },
      { type: JSTokenType.Identifier, value: "doSomething" },
      { type: JSTokenType.Delimiter, value: "(" },
      { type: JSTokenType.Delimiter, value: ")" },
      { type: JSTokenType.EndOfStatement, value: ";" },
    ];

    expect(() => parser.parse(tokens)).toThrow("Expected '}' to close block statement");
  });
  test("should parse an if-else statement", () => {
    const tokens: JSToken[] = [
        { type: JSTokenType.Keyword, value: "if" },
        { type: JSTokenType.Delimiter, value: "(" },
        { type: JSTokenType.Identifier, value: "x" },
        { type: JSTokenType.Operator, value: "==" },
        { type: JSTokenType.Literal, value: "42" },
        { type: JSTokenType.Delimiter, value: ")" },
        { type: JSTokenType.Delimiter, value: "{" },
        { type: JSTokenType.Identifier, value: "doSomething" },
        { type: JSTokenType.Delimiter, value: "(" },
        { type: JSTokenType.Delimiter, value: ")" },
        { type: JSTokenType.EndOfStatement, value: ";" },
        { type: JSTokenType.Delimiter, value: "}" },
        { type: JSTokenType.Keyword, value: "else" },
        { type: JSTokenType.Delimiter, value: "{" },
        { type: JSTokenType.Identifier, value: "doSomethingElse" },
        { type: JSTokenType.Delimiter, value: "(" },
        { type: JSTokenType.Delimiter, value: ")" },
        { type: JSTokenType.EndOfStatement, value: ";" },
        { type: JSTokenType.Delimiter, value: "}" },
    ];

    const ast = parser.parse(tokens);

    expect(ast).toEqual({
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
                            {
                                type: NodeType.Identifier,
                                value: "doSomething",
                            },
                        ],
                    },
                    {
                        type: NodeType.BlockStatement,
                        children: [
                            {
                                type: NodeType.Identifier,
                                value: "doSomethingElse",
                            },
                        ],
                    },
                ],
            },
        ],
    });
});

});
