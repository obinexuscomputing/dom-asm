import { DOMXMLASTNode, DOMXMLAST } from "./DOMXMLAST";
export interface StateNode {
    type: 'Element' | 'Text' | 'Comment' | 'Doctype';
    value?: string;
    transitions: Map<string, StateNode>;
    astChildren: Set<DOMXMLASTNode>;
    equivalenceClass: number;
}
export declare class DOMXMLOptimizer {
    private stateNodes;
    private nodeMap;
    optimize(ast: DOMXMLAST): DOMXMLAST;
    private initializeStructure;
    private buildEquivalenceClasses;
    private computeInitialSignature;
    private splitByTransitions;
    private computeTransitionSignature;
    private buildMinimizedAST;
    private computeMetadata;
}
//# sourceMappingURL=DOMXMLOptimizer.d.ts.map