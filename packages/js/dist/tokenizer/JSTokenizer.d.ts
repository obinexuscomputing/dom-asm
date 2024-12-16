export declare enum JSTokenType {
    Keyword = 0,
    Identifier = 1,
    Operator = 2,
    Delimiter = 3,
    Literal = 4,
    TemplateLiteral = 5,
    Comment = 6,
    EndOfStatement = 7
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