export type TokenType = 'StartTag' | 'EndTag' | 'Text' | 'Comment' | 'ConditionalComment' | 'Doctype' | 'CDATA' | 'EOF';
export interface BaseToken {
    type: TokenType;
    start: number;
    end: number;
    line: number;
    column: number;
}
export interface StartTagToken extends BaseToken {
    type: 'StartTag';
    name: string;
    attributes: Map<string, string>;
    selfClosing: boolean;
    namespace?: string;
}
export interface EndTagToken extends BaseToken {
    type: 'EndTag';
    name: string;
    namespace?: string;
}
export interface TextToken extends BaseToken {
    type: 'Text';
    content: string;
    isWhitespace: boolean;
}
export interface CommentToken extends BaseToken {
    type: 'Comment';
    data: string;
    isConditional?: boolean;
}
export interface ConditionalCommentToken extends BaseToken {
    type: 'ConditionalComment';
    condition: string;
    content: string;
}
export interface DoctypeToken extends BaseToken {
    type: 'Doctype';
    name: string;
    publicId?: string;
    systemId?: string;
}
export interface CDATAToken extends BaseToken {
    type: 'CDATA';
    content: string;
}
export interface EOFToken extends BaseToken {
    type: 'EOF';
}
export type HTMLToken = StartTagToken | EndTagToken | TextToken | CommentToken | ConditionalCommentToken | DoctypeToken | CDATAToken | EOFToken;
export interface TokenizerError {
    message: string;
    severity: 'warning' | 'error';
    line: number;
    column: number;
    start: number;
    end: number;
}
export interface TokenizerOptions {
    xmlMode?: boolean;
    recognizeCDATA?: boolean;
    recognizeConditionalComments?: boolean;
    preserveWhitespace?: boolean;
    allowUnclosedTags?: boolean;
    advanced?: boolean;
}
export interface TokenizerResult {
    tokens: HTMLToken[];
    errors: {
        message: string;
        line: number;
        column: number;
    }[];
}
export declare class HTMLTokenizer {
    private input;
    private position;
    private line;
    private column;
    private tokens;
    private errors;
    private options;
    constructor(input: string, options?: TokenizerOptions);
    tokenize(): TokenizerResult;
    private skipUntil;
    private processTag;
    private processText;
    private readAttributes;
    private readAttributeName;
    private handleStartTag;
    private handleEndTag;
    private processAdvancedTokens;
    private handleComment;
    private handleDoctype;
    private handleCDATA;
    private readTagName;
    private handleText;
    private readAttributeValue;
    private readQuotedString;
    private hasUnclosedTags;
    private peek;
    private match;
    private addToken;
    private skipWhitespace;
    private isAlphaNumeric;
    private isWhitespace;
    private advance;
    private addError;
    private reportError;
}
