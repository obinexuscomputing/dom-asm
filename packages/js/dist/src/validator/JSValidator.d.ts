import { JSASTNode } from "../ast";
export type ValidationError = {
    code: string;
    message: string;
    node: JSASTNode;
};
export declare class JSValidator {
    private errors;
    constructor();
    validate(ast: JSASTNode): ValidationError[];
    private addError;
    private traverse;
    private validateProgram;
    private validateVariableDeclaration;
    private validateArrowFunction;
    private validateTemplateLiteral;
    private validateObjectExpression;
    private validateProperty;
    private validateDestructuring;
    private validateClass;
    private validateMethodDefinition;
    private validatePropertyDefinition;
    private validateAsyncFunction;
    private validateAwaitExpression;
    private validateImport;
    private validateExport;
    private validateSpreadElement;
    private validateArrayExpression;
    private validateInlineConstant;
    private validateIdentifier;
    private validateLiteral;
}
//# sourceMappingURL=JSValidator.d.ts.map