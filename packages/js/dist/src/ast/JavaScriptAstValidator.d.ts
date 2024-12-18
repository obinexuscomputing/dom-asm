import { JavaScriptAstNode } from './JavaScriptAstNode';
interface ValidationError {
    code: string;
    message: string;
    node: JavaScriptAstNode;
}
export declare class JavaScriptAstValidator {
    private errors;
    constructor();
    validate(ast: JavaScriptAstNode): ValidationError[];
    private addError;
    traverse(node: JavaScriptAstNode): void;
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
export {};
//# sourceMappingURL=JavaScriptAstValidator.d.ts.map