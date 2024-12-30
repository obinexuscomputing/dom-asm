export type HTMLToken = {
    type: "Doctype";
    value: string;
    line: number;
    column: number;
    publicId?: string;
    systemId?: string;
} | {
    type: "StartTag";
    name: string;
    attributes: Map<string, string>;
    selfClosing: boolean;
    line: number;
    column: number;
    namespace?: string;
} | {
    type: "EndTag";
    name: string;
    line: number;
    column: number;
    namespace?: string;
} | {
    type: "Text";
    value: string;
    line: number;
    column: number;
    isWhitespace: boolean;
} | {
    type: "Comment";
    value: string;
    line: number;
    column: number;
    isConditional: boolean;
} | {
    type: "CDATA";
    value: string;
    line: number;
    column: number;
};
export interface TokenizerError {
    message: string;
    line: number;
    column: number;
}
export declare class HTMLTokenizer {
    private static readonly VOID_ELEMENTS;
    private input;
    private position;
    private line;
    private column;
    private lastTokenEnd;
    private errors;
    private openTags;
    private options;
    constructor(input: string, options?: Partial<HTMLTokenizer['options']>);
    private tokenize;
    private readEndTag;
    private readTagName;
    private createTextToken;
    private shouldAddTextToken;
    private readStartTag;
    private isValidUnquotedAttributeValue;
    private consume;
    private readAttributeName;
    private readAttributeValue;
    private readCDATA;
    private readComment;
    private readDoctype;
    private readQuotedString;
    private advance;
    private addError;
    private reset;
    private peek;
    private match;
    private skipWhitespace;
    private getCurrentLocation;
}
