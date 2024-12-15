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
    private static readonly VOID_ELEMENTS;
    tokenize(): DOMXMLToken[];
    private readStartTag;
    private readEndTag;
    private readTagName;
    private readAttributes;
    private readAttributeName;
    private readAttributeValue;
    private readComment;
    private readDoctype;
}
//# sourceMappingURL=DOMXMLTokenizer.d.ts.map