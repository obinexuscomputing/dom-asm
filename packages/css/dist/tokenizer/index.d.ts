export type Token = {
    type: string;
    value: string;
    position: {
        line: number;
        column: number;
    };
};
export declare class CSSTokenizer {
    private input;
    private position;
    private line;
    private column;
    constructor(input: string);
    private isWhitespace;
    private isCommentStart;
    private isDelimiter;
    private consumeWhitespace;
    private consumeComment;
    private consumeDelimiter;
    private consumeOther;
    tokenize(): Token[];
}
