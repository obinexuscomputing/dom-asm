import { HTMLASTNode } from "../ast";
import { HTMLToken } from "../tokenizer";
export declare class HTMLParserError extends Error {
    token: HTMLToken;
    position: number;
    constructor(message: string, token: HTMLToken, position: number);
}
export interface HTMLElementNode {
    type: "Element";
    name: string;
    attributes: Record<string, string>;
    children: HTMLASTNode[];
}
export interface HTMLTextNode {
    type: "Text";
    value: string;
}
export interface HTMLCommentNode {
    type: "Comment";
    value: string;
}
export declare class HTMLParser {
    private tokenizer;
    constructor();
    parse(input: string): HTMLASTNode;
    private buildAST;
}
//# sourceMappingURL=index.d.ts.map