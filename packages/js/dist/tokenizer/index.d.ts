export declare enum TokenType {
    Keyword = 0,
    Identifier = 1,
    Operator = 2,
    Delimiter = 3,
    Literal = 4,
    EndOfStatement = 5
}
export interface Token {
    type: TokenType;
    value: string;
}
export declare class Tokenizer {
    private keywords;
    private operators;
    private delimiters;
    tokenize(input: string): Token[];
}
//# sourceMappingURL=index.d.ts.map