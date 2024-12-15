import { ASTNode } from "../ast";
export declare class Validator {
    private ast;
    private errors;
    constructor(ast: ASTNode);
    private validateStylesheet;
    private validateRule;
    private validateDeclaration;
    validate(): string[];
}
//# sourceMappingURL=index.d.ts.map