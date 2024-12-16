import { DOMXMLToken } from "..";
import { DOMXMLAST } from "../ast";
export declare class DOMXMLParser {
    private tokens;
    private position;
    constructor(tokens?: DOMXMLToken[]);
    /**
     * Set new tokens for parsing.
     * @param tokens - Array of DOMXMLToken objects.
     */
    setTokens(tokens: DOMXMLToken[]): void;
    /**
     * Parses the tokens into a DOMXMLAST.
     * @returns The parsed DOMXMLAST.
     */
    parse(): DOMXMLAST;
    /**
     * Computes metadata for the AST.
     * @param root - The root node of the AST.
     * @returns Metadata containing node counts.
     */
    private computeMetadata;
}
//# sourceMappingURL=DOMXMLParser.d.ts.map