export type HTMLToken = {
    type: "Doctype";
    value: string;
    line: number;
    column: number;
} | {
    type: "StartTag";
    name: string;
    attributes: Record<string, string>;
    selfClosing: boolean;
    line: number;
    column: number;
} | {
    type: "EndTag";
    name: string;
    line: number;
    column: number;
} | {
    type: "Text";
    value: string;
    line: number;
    column: number;
} | {
    type: "Comment";
    value: string;
    line: number;
    column: number;
};
export declare class HTMLTokenizer {
    private input;
    private position;
    private line;
    private column;
    constructor(input: string);
    tokenize(): HTMLToken[];
    private readDoctype;
    private readStartTag;
    private readEndTag;
    private readComment;
    private readText;
    private readUntil;
    private peek;
    private match;
    private matches;
    private consume;
    private skipWhitespace;
    private getCurrentLocation;
}
//# sourceMappingURL=index.d.ts.map