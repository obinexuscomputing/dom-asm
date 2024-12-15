import { DOMXMLAST } from "../ast";
import { DOMXMLToken } from "../tokenizer";
export declare class DOMXMLParser {
    private tokens;
    private position;
    constructor();
    parse(tokens: DOMXMLToken[]): DOMXMLAST;
    private computeMetadata;
}
//# sourceMappingURL=DOMXMLParser.d.ts.map