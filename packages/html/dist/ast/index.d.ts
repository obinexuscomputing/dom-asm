export interface HTMLASTNode {
    type: "Element" | "Text" | "Comment";
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
//# sourceMappingURL=index.d.ts.map