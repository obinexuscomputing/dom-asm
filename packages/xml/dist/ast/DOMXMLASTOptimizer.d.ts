import { DOMXMLASTNode, DOMXMLAST } from "./DOMXMLAST";
export declare class DOMXMLASTOptimizer {
    /**
     * Optimize the given AST by removing redundant nodes, merging text nodes, and recalculating metadata.
     */
    optimize(ast: DOMXMLAST): DOMXMLAST;
    private optimizeChildren;
    private optimizeNode;
    /**
     * Compute metadata for the optimized AST.
     */
    computeMetadata(root: DOMXMLASTNode): DOMXMLAST["metadata"];
}
//# sourceMappingURL=DOMXMLASTOptimizer.d.ts.map