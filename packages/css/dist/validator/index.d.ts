import { ASTNode } from "../ast";
export declare class CSSValidator {
    private ast;
    private errors;
    constructor(ast: ASTNode);
    private validateStylesheet;
    private validateRule;
    private validateDeclaration;
    validate(): string[];
}
//# sourceMappingURL=index.d.ts.map