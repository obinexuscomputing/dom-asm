export declare enum JSTokenType {
    Keyword = 0,
    Identifier = 1,
    Operator = 2,
    Delimiter = 3,
    Literal = 4,
    TemplateLiteral = 5,
    Comment = 6,
    EndOfStatement = 7,
    Number = 8,
    String = 9
}
export interface JSToken {
    type: JSTokenType;
    value: string;
}
export declare class JSTokenizer {
    private keywords;
    private operators;
    private singleCharDelimiters;
    private previousToken;
    constructor();
    shouldAddSemicolon(tokens: JSToken[]): boolean;
    private readOperator;
    tokenize(input: string): JSToken[];
}
//# sourceMappingURL=index.d.ts.map