export interface HTMLToken {
    type: "StartTag" | "EndTag" | "Text" | "Comment";
    name?: string;
    value?: string;
    attributes?: Record<string, string>;
}
export declare class HTMLTokenizer {
    private input;
    private position;
    constructor(input: string);
    tokenize(): HTMLToken[];
    private readStartTag;
    private readEndTag;
    private readComment;
    private readText;
    private readUntil;
}
//# sourceMappingURL=index.d.ts.map