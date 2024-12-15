export interface HTMLASTNode {
    type: "Element" | "Text" | "Comment";
    name?: string;
    value?: string;
    attributes?: Record<string, string>;
    children?: HTMLASTNode[];
}
//# sourceMappingURL=index.d.ts.map