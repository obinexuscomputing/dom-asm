import { HTMLASTOptimizer } from "../src/ast/HTMLASTOptimizer";
import { HTMLAST } from "../src/ast/HTMLAST";

describe("HTMLASTOptimizer", () => {
  it("should remove empty text nodes", () => {
    const ast: HTMLAST = {
      root: {
        type: "Element",
        name: "div",
        children: [
          { type: "Text", value: "  " },
          { type: "Text", value: "\n" },
          { type: "Text", value: "Non-empty" },
        ],
      },
    };

    const optimizer = new HTMLASTOptimizer();
    optimizer.optimize(ast);

    expect(ast.root.children).toHaveLength(1);
    expect(ast.root.children[0].type).toBe("Text");
    expect(ast.root.children[0].value).toBe("Non-empty");
  });

  it("should merge adjacent text nodes and preserve spaces", () => {
    const ast: HTMLAST = {
      root: {
        type: "Element",
        name: "div",
        children: [
          { type: "Text", value: "Hello" },
          { type: "Text", value: " " },
          { type: "Text", value: "World" },
        ],
      },
    };

    const optimizer = new HTMLASTOptimizer();
    optimizer.optimize(ast);

    expect(ast.root.children).toHaveLength(1);
    expect(ast.root.children[0].value).toBe("Hello World");
  });

  it("should handle nested elements correctly", () => {
    const ast: HTMLAST = {
      root: {
        type: "Element",
        name: "div",
        children: [
          {
            type: "Element",
            name: "span",
            children: [
              { type: "Text", value: "Nested" },
              { type: "Text", value: " Content" },
            ],
          },
        ],
      },
    };

    const optimizer = new HTMLASTOptimizer();
    optimizer.optimize(ast);

    const spanNode = ast.root.children[0];
    expect(spanNode.children).toHaveLength(1);
    expect(spanNode.children[0].value).toBe("Nested Content");
  });

  it("should handle empty children gracefully", () => {
    const ast: HTMLAST = {
      root: {
        type: "Element",
        name: "div",
        children: [],
      },
    };

    const optimizer = new HTMLASTOptimizer();
    optimizer.optimize(ast);

    expect(ast.root.children).toHaveLength(0);
  });

  it("should optimize complex mixed content", () => {
    const ast: HTMLAST = {
      root: {
        type: "Element",
        name: "div",
        children: [
          { type: "Text", value: "Hello" },
          { type: "Text", value: " " },
          {
            type: "Element",
            name: "span",
            children: [
              { type: "Text", value: "Nested" },
              { type: "Text", value: " Content" },
            ],
          },
          { type: "Text", value: "!" },
        ],
      },
    };

    const optimizer = new HTMLASTOptimizer();
    optimizer.optimize(ast);

    const rootChildren = ast.root.children;
    expect(rootChildren).toHaveLength(3);

    const textNode = rootChildren[0];
    expect(textNode.type).toBe("Text");
    expect(textNode.value).toBe("Hello ");

    const spanNode = rootChildren[1];
    expect(spanNode.children).toHaveLength(1);
    expect(spanNode.children[0].value).toBe("Nested Content");

    const exclamationNode = rootChildren[2];
    expect(exclamationNode.type).toBe("Text");
    expect(exclamationNode.value).toBe("!");
  });
});
