export type Token = {
    type: string;
    value: string;
    position: {
        line: number;
        column: number;
    };
};
export declare class Tokenizer {
    private input;
    private position;
    private line;
    private column;
    constructor(input: string);
    private isWhitespace;
    private isCommentStart;
    private consumeWhitespace;
    private consumeComment;
    private consumeOther;
    tokenize(): Token[];
}
