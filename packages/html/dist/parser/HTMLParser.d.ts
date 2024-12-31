import { HTMLToken } from '../tokenizer/HTMLTokenizer';
interface ParserState {
    type: 'Initial' | 'InTag' | 'InContent' | 'InComment' | 'InDoctype' | 'Final';
    isAccepting: boolean;
    transitions: Map<string, ParserState>;
}
export interface HTMLASTNode {
    type: 'Element' | 'Text' | 'Comment' | 'Doctype';
    name?: string;
    value?: string;
    attributes?: Map<string, string>;
    children: HTMLASTNode[];
    metadata: {
        equivalenceClass: number;
        isMinimized: boolean;
    };
}
export interface HTMLAST {
    root: HTMLASTNode;
    metadata: {
        nodeCount: number;
        elementCount: number;
        textCount: number;
        commentCount: number;
        minimizationMetrics?: {
            originalStateCount: number;
            minimizedStateCount: number;
            optimizationRatio: number;
        };
    };
}
export declare class HTMLParserError extends Error {
    token: HTMLToken;
    state: ParserState;
    position: number;
    constructor(message: string, token: HTMLToken, state: ParserState, position: number);
}
export declare class HTMLParser {
    private states;
    private currentState;
    private equivalenceClasses;
    private optimizedStateMap;
    constructor();
    private initializeStates;
    parse(input: string): HTMLAST;
    private minimizeStates;
    private splitBlock;
    private getStateSignature;
    private buildOptimizedAST;
    private processTokenWithOptimizedState;
    private optimizeAST;
    private mergeTextNodes;
    private removeRedundantNodes;
    private optimizeAttributes;
    private getEquivalenceClass;
    private handleParserError;
    private computeOptimizedMetadata;
}
export {};
