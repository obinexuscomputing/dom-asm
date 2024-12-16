import { JSASTNode } from "../ast/JSAst";
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
//# sourceMappingURL=index.d.ts.map