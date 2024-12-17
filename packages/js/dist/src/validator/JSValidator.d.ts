import { ValidationError, JSASTNode } from "../types";
export declare class JSValidator {
    private errors;
    constructor();
    validate(ast: JSASTNode): ValidationError[];
    private addError;
    private traverse;
    private validateProgram;
    private validateVariableDeclaration;
    private validateBlockStatement;
    private validateArrowFunction;
    private validateTemplateLiteral;
    private validateClass;
    private validateMethodDefinition;
    private validateAsyncFunction;
    private validateObjectExpression;
    private validateProperty;
    private validateImport;
    private validateExport;
    private validateInlineConstant;
    private validateIdentifier;
    private validateLiteral;
}
//# sourceMappingURL=JSValidator.d.ts.map