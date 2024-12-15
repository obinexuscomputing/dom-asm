import { HTMLToken } from "../tokenizer";
export interface HTMLASTNode {
    type: "Element" | "Text" | "Comment" | "Doctype";
    name?: string;
    value?: string;
    attributes?: Record<string, string>;
    children?: HTMLASTNode[];
}
export interface HTMLAST {
    root: HTMLASTNode;
    metadata?: {
        nodeCount: number;
        elementCount: number;
        textCount: number;
        commentCount: number;
    };
}
export declare class HTMLASTBuilder {
    private tokens;
    private position;
    constructor(tokens: HTMLToken[]);
    buildAST(): HTMLAST;
    private computeMetadata;
}
//# sourceMappingURL=HTMLAST.d.ts.map