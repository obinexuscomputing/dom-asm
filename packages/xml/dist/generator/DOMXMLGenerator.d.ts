import { DOMXMLAST } from "../ast";
export interface GeneratorOptions {
    indent?: string;
    newLine?: string;
    xmlDeclaration?: boolean;
    prettyPrint?: boolean;
}
export declare class DOMXMLGenerator {
    private options;
    constructor(options?: GeneratorOptions);
    generate(ast: DOMXMLAST): string;
    private generateNode;
    private generateElement;
    private generateText;
    private generateComment;
    private generateDoctype;
    private getIndent;
    private escapeText;
    private escapeAttribute;
}
//# sourceMappingURL=DOMXMLGenerator.d.ts.map