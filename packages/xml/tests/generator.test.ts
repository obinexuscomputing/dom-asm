import { DOMXMLGenerator } from "../src/generator/DOMXMLGenerator";
import { DOMXMLAST, DOMXMLASTNode } from "../src/ast";

describe("DOMXMLGenerator", () => {
  let generator: DOMXMLGenerator;

  beforeEach(() => {
    generator = new DOMXMLGenerator({ prettyPrint: true });
  });

  test("should generate simple XML", () => {
    const rootNode: DOMXMLASTNode = {
      type: "Element",
      name: "root",
      children: [
        {
          type: "Element",
          name: "child",
          children: [
            {
              type: "Text",
              value: "Test",
            },
          ],
        },
      ],
    };

    const ast = new DOMXMLAST(rootNode, {
      nodeCount: 3,
      elementCount: 2,
      textCount: 1,
      commentCount: 0,
    });

    const xml = generator.generate(ast);
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain("<root>");
    expect(xml).toContain("  <child>Test</child>");
    expect(xml).toContain("</root>");
  });

  test("should handle attributes", () => {
    const rootNode: DOMXMLASTNode = {
      type: "Element",
      name: "root",
      attributes: { id: "main" },
      children: [],
    };

    const ast = new DOMXMLAST(rootNode, {
      nodeCount: 1,
      elementCount: 1,
      textCount: 0,
      commentCount: 0,
    });

    const xml = generator.generate(ast);
    expect(xml).toContain('<root id="main"/>');
  });

  test("should escape special characters", () => {
    const rootNode: DOMXMLASTNode = {
      type: "Element",
      name: "root",
      children: [
        {
          type: "Text",
          value: "< & >",
        },
      ],
    };

    const ast = new DOMXMLAST(rootNode, {
      nodeCount: 2,
      elementCount: 1,
      textCount: 1,
      commentCount: 0,
    });

    const xml = generator.generate(ast);
    expect(xml).toContain("&lt; &amp; &gt;");
  });
});
