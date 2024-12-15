type Token = {
    type: "StartTag";
    name: string;
    attributes: Record<string, string>;
} | {
    type: "EndTag";
    name: string;
} | {
    type: "Text";
    value: string;
} | {
    type: "Comment";
    value: string;
};
export declare enum TokenType {
    Keyword = "keyword",
    Identifier = "identifier",
    Number = "number",
    String = "string"
}
declare class HTMLTokenizer {
    private input;
    private position;
    constructor(input: string);
    tokenize(): Token[];
    private readStartTag;
    private readEndTag;
    private readComment;
    private readText;
    private readUntil;
}
export { HTMLTokenizer, Token };
//# sourceMappingURL=index.d.ts.map