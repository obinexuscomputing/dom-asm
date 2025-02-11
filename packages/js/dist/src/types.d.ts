export declare enum JSTokenType {
    Keyword = "Keyword",
    Identifier = "Identifier",
    Operator = "Operator",
    Delimiter = "Delimiter",
    Literal = "Literal",
    EndOfStatement = "EndOfStatement"
}
export interface JSToken {
    type: JSTokenType;
    value: string;
    line?: number;
    column?: number;
}
export interface BaseNode {
    type: NodeType;
    value?: string;
    children?: BaseNode[];
    line?: number;
    column?: number;
}
export interface JSASTNode extends BaseNode {
    children?: JSASTNode[];
}
export interface TypedJSASTNode extends JSASTNode {
    body?: TypedJSASTNode[];
    type: NodeType;
}
export interface ValidationError {
    code: string;
    message: string;
    node: JSASTNode;
}
export interface ParseOptions {
    sourceType?: 'module' | 'script';
    strict?: boolean;
}
export declare const Types: {
    NodeType: any;
    JSTokenType: typeof JSTokenType;
};
//# sourceMappingURL=types.d.ts.map