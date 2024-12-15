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
    tokenize(): DOMXMLToken[];
    private readStartTag;
    private readEndTag;
    private readText;
    private readComment;
    private readDoctype;
    private readAttributes;
}
//# sourceMappingURL=DOMXMLTokenizer.d.ts.map