export declare enum TokenType {
    Keyword = 0,
    Identifier = 1,
    Operator = 2,
    Delimiter = 3,
    Literal = 4,
    TemplateLiteral = 5,
    Comment = 6,
    EndOfStatement = 7
}
export interface Token {
    type: TokenType;
    value: string;
}
export declare class Tokenizer {
    private keywords;
    private operators;
    private delimiters;
    private singleCharDelimiters;
    private previousToken;
    private isNumericStart;
    private isValidNumber;
    private readNumber;
    private readMultilineComment;
    private readTemplateLiteral;
    private readOperator;
    private readIdentifier;
    private shouldAddSemicolon;
    tokenize(input: string): Token[];
}
