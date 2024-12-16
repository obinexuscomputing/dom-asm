import { HTMLToken } from "../tokenizer/HTMLTokenizer";
export interface HTMLAST {
    root: HTMLASTNode;
    metadata?: {
        nodeCount: number;
        elementCount: number;
        textCount: number;
        commentCount: number;
    };
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
export declare class HTMLASTNode {
    type: "Element" | "Text" | "Comment" | "Doctype";
    name?: string;
    value?: string;
    attributes?: Record<string, string>;
    children: HTMLASTNode[];
    constructor(type: "Element" | "Text" | "Comment" | "Doctype", children?: HTMLASTNode[], options?: {
        name?: string;
        value?: string;
        attributes?: Record<string, string>;
    });
}
export declare class HTMLASTBuilder {
    private tokens;
    constructor(tokens: HTMLToken[]);
    buildAST(): HTMLAST;
    private computeMetadata;
}
//# sourceMappingURL=HTMLAST.d.ts.map