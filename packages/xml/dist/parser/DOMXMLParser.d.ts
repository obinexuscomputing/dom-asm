import { DOMXMLToken } from "../tokenizer/DOMXMLTokenizer";
import { DOMXMLAST } from "../ast/DOMXMLAST";
export declare class DOMXMLParser {
    private tokens;
    private position;
    constructor(tokens: DOMXMLToken[]);
    parse(): DOMXMLAST;
    private computeMetadata;
}
//# sourceMappingURL=DOMXMLParser.d.ts.map