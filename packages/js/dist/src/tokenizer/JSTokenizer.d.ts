export declare enum JSTokenType {
    Keyword = "Keyword",
    Identifier = "Identifier",
    Operator = "Operator",
    Delimiter = "Delimiter",
    Literal = "Literal",
    TemplateLiteral = "TemplateLiteral",
    Comment = "Comment",
    EndOfStatement = "EndOfStatement"
}
export interface JSToken {
    type: JSTokenType;
    value: string;
}
export declare class JSTokenizer {
    private keywords;
    private operators;
    private delimiters;
    tokenize(input: string): JSToken[];
}
//# sourceMappingURL=JSTokenizer.d.ts.map