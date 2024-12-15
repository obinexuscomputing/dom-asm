import { HTMLASTBuilder } from "../src/ast/HTMLAST";
import { HTMLToken } from "../src/tokenizer";

describe("HTMLASTBuilder", () => {
  it("should build an AST from valid HTML tokens", () => {
    const tokens: HTMLToken[] = [
      { type: "StartTag", name: "div", attributes: {}, selfClosing: false },
      { type: "Text", value: "Hello World" },
      { type: "EndTag", name: "div" },
    ];
    const builder = new HTMLASTBuilder(tokens);
    const ast = builder.buildAST();

    expect(ast.root.children).toHaveLength(1);
    const divNode = ast.root.children[0];
    expect(divNode.name).toBe("div");
    expect(divNode.children).toHaveLength(1);
    expect(divNode.children[0].type).toBe("Text");
    expect(divNode.children[0].value).toBe("Hello World");
  });

  it("should handle nested elements correctly", () => {
    const tokens: HTMLToken[] = [
      { type: "StartTag", name: "div", attributes: {}, selfClosing: false },
      { type: "StartTag", name: "span", attributes: {}, selfClosing: false },
      { type: "Text", value: "Nested Content" },
      { type: "EndTag", name: "span" },
      { type: "EndTag", name: "div" },
    ];
    const builder = new HTMLASTBuilder(tokens);
    const ast = builder.buildAST();

    const divNode = ast.root.children[0];
    expect(divNode.name).toBe("div");
    expect(divNode.children).toHaveLength(1);

    const spanNode = divNode.children[0];
    expect(spanNode.name).toBe("span");
    expect(spanNode.children[0].value).toBe("Nested Content");
  });

  it("should recover from unmatched end tags", () => {
    const tokens: HTMLToken[] = [
      { type: "StartTag", name: "div", attributes: {}, selfClosing: false },
      { type: "EndTag", name: "span" }, // Unmatched end tag
      { type: "EndTag", name: "div" },
    ];
    const builder = new HTMLASTBuilder(tokens);
    const ast = builder.buildAST();

    const divNode = ast.root.children[0];
    expect(divNode.name).toBe("div");
    expect(divNode.children).toHaveLength(0); // No unmatched child added
  });

  it("should handle self-closing tags", () => {
    const tokens: HTMLToken[] = [
      { type: "StartTag", name: "img", attributes: { src: "image.png" }, selfClosing: true },
    ];
    const builder = new HTMLASTBuilder(tokens);
    const ast = builder.buildAST();

    const imgNode = ast.root.children[0];
    expect(imgNode.name).toBe("img");
    expect(imgNode.attributes.src).toBe("image.png");
    expect(imgNode.children).toHaveLength(0); // Self-closing, no children
  });

  it("should handle comments and text nodes", () => {
    const tokens: HTMLToken[] = [
      { type: "Comment", value: "This is a comment" },
      { type: "Text", value: "Some text content" },
    ];
    const builder = new HTMLASTBuilder(tokens);
    const ast = builder.buildAST();

    const commentNode = ast.root.children[0];
    expect(commentNode.type).toBe("Comment");
    expect(commentNode.value).toBe("This is a comment");

    const textNode = ast.root.children[1];
    expect(textNode.type).toBe("Text");
    expect(textNode.value).toBe("Some text content");
  });

  it("should return an empty AST for empty input", () => {
    const tokens: HTMLToken[] = [];
    const builder = new HTMLASTBuilder(tokens);
    const ast = builder.buildAST();

    expect(ast.root.children).toHaveLength(0);
  });
});
