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
    private readStartTag;
    private readComment;
    private readText;
    private readEndTag;
    private readTagName;
    readDoctype(): HTMLToken;
    private peek;
    private match;
    private readUntil;
    private consume;
    private skipWhitespace;
    private getCurrentLocation;
}
//# sourceMappingURL=HTMLTokenizer.d.ts.map