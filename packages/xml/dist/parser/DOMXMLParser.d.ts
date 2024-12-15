import { DOMXMLToken } from "..";
import { DOMXMLAST } from "../ast";
export declare class DOMXMLParser {
    private tokens;
    private position;
    constructor(tokens?: DOMXMLToken[]);
    setTokens(tokens: DOMXMLToken[]): void;
    parse(): DOMXMLAST;
    private computeMetadata;
}
//# sourceMappingURL=DOMXMLParser.d.ts.map