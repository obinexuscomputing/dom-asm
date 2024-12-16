import { JSASTNode } from "../ast";
export declare class JSValidator {
    private errors;
    constructor();
    validate(ast: JSASTNode): string[];
    private traverse;
    private validateProgram;
    private validateVariableDeclaration;
    private validateInlineConstant;
    private validateIdentifier;
    private validateLiteral;
}
//# sourceMappingURL=JSValidator.d.ts.map