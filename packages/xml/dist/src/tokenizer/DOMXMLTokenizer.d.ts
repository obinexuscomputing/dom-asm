import { XMLBaseTokenizer } from './XMLBaseTokenizer';
export interface DOMXMLToken {
    type: 'StartTag' | 'EndTag' | 'Text' | 'Comment' | 'Doctype';
    name?: string;
    value?: string;
    attributes?: Record<string, string>;
    selfClosing?: boolean;
    location: {
        line: number;
        column: number;
    };
}
export declare class DOMXMLTokenizer extends XMLBaseTokenizer {
    constructor(input: string);
    tokenize(): DOMXMLToken[];
    readText(): DOMXMLToken;
    private readStartTag;
    private readEndTag;
    private readComment;
    private readDoctype;
    private readAttributes;
    private readTagName;
    private readAttributeName;
    private readAttributeValue;
}
//# sourceMappingURL=DOMXMLTokenizer.d.ts.map