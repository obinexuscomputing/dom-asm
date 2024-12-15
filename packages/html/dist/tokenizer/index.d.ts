export type HTMLToken = {
    type: "Doctype";
    value: string;
} | {
    type: "StartTag";
    name: string;
    attributes: Record<string, string>;
    selfClosing: boolean;
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
export declare class HTMLTokenizer {
    private input;
    private position;
    constructor(input: string);
    tokenize(): HTMLToken[];
    private readDoctype;
    private readStartTag;
    private readEndTag;
    private readComment;
    private readText;
    private readUntil;
}
//# sourceMappingURL=index.d.ts.map