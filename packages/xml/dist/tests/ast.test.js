import { DOMXMLAST } from '../src/ast';
import { DOMXMLASTOptimizer } from '../src/ast/DOMXMLASTOptimizer';
describe('DOMXMLASTOptimizer', () => {
    let optimizer;
    beforeEach(() => {
        optimizer = new DOMXMLASTOptimizer();
    });
    test("should optimize AST by removing empty text nodes", () => {
        const rootNode = {
            type: "Element",
            name: "root",
            children: [
                { type: "Text", value: "   " }, // Empty text node
                { type: "Element", name: "child", children: [] }, // Valid element
                { type: "Text", value: "Hello" }, // Non-empty text node
            ],
        };
        const ast = new DOMXMLAST(rootNode, {
            nodeCount: 3,
            elementCount: 1,
            textCount: 2,
            commentCount: 0,
        });
        const optimizedAST = optimizer.optimize(ast);
        const children = optimizedAST.root.children || [];
        expect(children).toHaveLength(2); // Keep the non-empty text and the valid element
        expect(children[0]).toEqual({
            type: "Element",
            name: "child",
            children: [],
        });
        expect(children[1]).toEqual({
            type: "Text",
            value: "Hello",
        });
    });
    test('should merge adjacent text nodes', () => {
        const rootNode = {
            type: 'Element',
            name: 'root',
            children: [
                { type: 'Text', value: 'Hello ' },
                { type: 'Text', value: 'World!' },
            ],
        };
        const ast = new DOMXMLAST(rootNode, {
            nodeCount: 2,
            elementCount: 0,
            textCount: 2,
            commentCount: 0,
        });
        const optimizedAST = optimizer.optimize(ast);
        const children = optimizedAST.root.children || [];
        expect(children).toHaveLength(1); // Merge text nodes
        expect(children[0]).toEqual({
            type: 'Text',
            value: 'Hello World!',
        });
    });
    test('should preserve non-empty elements and attributes', () => {
        const rootNode = {
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
        };
        const ast = new DOMXMLAST(rootNode, {
            nodeCount: 2,
            elementCount: 1,
            textCount: 1,
            commentCount: 0,
        });
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
});
//# sourceMappingURL=ast.test.js.map