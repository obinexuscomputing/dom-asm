import { DOMXMLAST } from "../ast";
import { DOMXMLToken } from "../tokenizer";
export declare class DOMXMLParser {
    private tokens;
    private position;
    constructor(tokens?: DOMXMLToken[]);
    setTokens(tokens: DOMXMLToken[]): void;
    parse(): DOMXMLAST;
    private removeEmptyTextNodes;
    private computeMetadata;
}
//# sourceMappingURL=DOMXMLParser.d.ts.map