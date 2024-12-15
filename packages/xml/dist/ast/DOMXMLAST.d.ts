export interface DOMXMLASTNode {
    type: "Element" | "Text" | "Comment" | "Doctype";
    name?: string;
    value?: string;
    attributes?: Record<string, string>;
    children?: DOMXMLASTNode[];
    equivalenceClass?: number;
    optimizationData?: {
        hash: string;
        transitionSignature?: string;
        isMinimized?: boolean;
    };
}
export interface DOMXMLAST {
    root: DOMXMLASTNode;
    metadata?: {
        nodeCount: number;
        elementCount: number;
        textCount: number;
        commentCount: number;
        optimizationMetrics?: {
            originalStateCount: number;
            minimizedStateCount: number;
            reductionPercentage: number;
        };
    };
}
export interface OptimizationContext {
    stateMap: Map<string, DOMXMLASTNode>;
    equivalenceClasses: Map<number, Set<DOMXMLASTNode>>;
    currentClass: number;
}
//# sourceMappingURL=DOMXMLAST.d.ts.map