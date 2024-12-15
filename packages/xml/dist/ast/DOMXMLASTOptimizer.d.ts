import { DOMXMLAST } from "./DOMXMLAST";
export declare class DOMXMLASTOptimizer {
    /**
     * Optimize the given AST by removing redundant nodes, merging text nodes, and recalculating metadata.
     */
    optimize(ast: DOMXMLAST): DOMXMLAST;
    /**
     * Optimize children nodes by removing empty nodes and merging adjacent text nodes.
     */
    private optimizeChildren;
    private optimizeNode;
    /**
     * Compute metadata for the optimized AST.
     */
    private computeMetadata;
}
//# sourceMappingURL=DOMXMLASTOptimizer.d.ts.map