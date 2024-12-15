import { DOMXMLAST, DOMXMLASTNode } from '../src/ast';
import { DOMXMLOptimizer } from '../src/ast/DOMXMLOptimizer';

describe('DOMXMLOptimizer', () => {
  let optimizer: DOMXMLOptimizer;

  beforeEach(() => {
    optimizer = new DOMXMLOptimizer();
  });

  test('should optimize AST by removing empty text nodes', () => {
    const ast: DOMXMLAST = {
      root: {
        type: 'Element',
        name: 'root',
        children: [
          { type: 'Text', value: '   ' }, // Empty text node
          { type: 'Element', name: 'child', children: [] },
          { type: 'Text', value: 'Hello' }, // Non-empty text node
        ],
      },
    };

    const optimizedAST = optimizer.optimize(ast);

    const children = optimizedAST.root.children || [];
    expect(children).toHaveLength(2); // Remove empty text node
    expect(children[0]).toEqual({
      type: 'Element',
      name: 'child',
      children: [],
    });
    expect(children[1]).toEqual({
      type: 'Text',
      value: 'Hello',
    });
  });

  test('should merge adjacent text nodes', () => {
    const ast: DOMXMLAST = {
      root: {
        type: 'Element',
        name: 'root',
        children: [
          { type: 'Text', value: 'Hello ' },
          { type: 'Text', value: 'World!' },
        ],
      },
    };

    const optimizedAST = optimizer.optimize(ast);

    const children = optimizedAST.root.children || [];
    expect(children).toHaveLength(1); // Merge text nodes
    expect(children[0]).toEqual({
      type: 'Text',
      value: 'Hello World!',
    });
  });

  test('should preserve non-empty elements and attributes', () => {
    const ast: DOMXMLAST = {
      root: {
        type: 'Element',
        name: 'root',
        children: [
          {
            type: 'Element',
            name: 'child',
            attributes: { id: 'test' },
            children: [],
          },
          { type: 'Text', value: 'Content' },
        ],
      },
    };

    const optimizedAST = optimizer.optimize(ast);

    const children = optimizedAST.root.children || [];
    expect(children).toHaveLength(2);
    expect(children[0]).toEqual({
      type: 'Element',
      name: 'child',
      attributes: { id: 'test' },
      children: [],
    });
    expect(children[1]).toEqual({
      type: 'Text',
      value: 'Content',
    });
  });

  test('should calculate accurate metadata after optimization', () => {
    const ast: DOMXMLAST = {
      root: {
        type: 'Element',
        name: 'root',
        children: [
          { type: 'Text', value: 'Hello' },
          { type: 'Text', value: ' ' },
          { type: 'Element', name: 'child', children: [] },
        ],
      },
    };

    const optimizedAST = optimizer.optimize(ast);

    expect(optimizedAST.metadata).toEqual({
      nodeCount: 2,
      elementCount: 1,
      textCount: 1,
      commentCount: 0,
    });
  });

  test('should handle nested elements correctly', () => {
    const ast: DOMXMLAST = {
      root: {
        type: 'Element',
        name: 'root',
        children: [
          {
            type: 'Element',
            name: 'parent',
            children: [
              { type: 'Text', value: ' ' }, // Empty text node
              { type: 'Element', name: 'child', children: [] },
            ],
          },
        ],
      },
    };

    const optimizedAST = optimizer.optimize(ast);

    const children = optimizedAST.root.children || [];
    expect(children).toHaveLength(1);
    expect(children[0]).toEqual({
      type: 'Element',
      name: 'parent',
      children: [
        {
          type: 'Element',
          name: 'child',
          children: [],
        },
      ],
    });
  });

  test('should remove elements with no attributes or content', () => {
    const ast: DOMXMLAST = {
      root: {
        type: 'Element',
        name: 'root',
        children: [
          {
            type: 'Element',
            name: 'emptyElement',
            children: [],
          },
          {
            type: 'Element',
            name: 'nonEmptyElement',
            attributes: { id: 'keep' },
            children: [],
          },
        ],
      },
    };

    const optimizedAST = optimizer.optimize(ast);

    const children = optimizedAST.root.children || [];
    expect(children).toHaveLength(1);
    expect(children[0]).toEqual({
      type: 'Element',
      name: 'nonEmptyElement',
      attributes: { id: 'keep' },
      children: [],
    });
  });
});
