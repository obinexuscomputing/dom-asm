interface ValidationError {
    code: string;
    message: string;
    node: JavaScriptAstNode;
}
export type JavaScriptAstNode = {
    type: string;
    value?: string;
    children?: JavaScriptAstNode[];
};
export declare class JavaScriptAstValidator {
    errors: ValidationError[];
    constructor();
    validate(ast: JavaScriptAstNode): ValidationError[];
    addError(code: string, message: string, node: JavaScriptAstNode): void;
    traverse(node: JavaScriptAstNode): void;
    validateProgram(node: JavaScriptAstNode): void;
    validateVariableDeclaration(node: JavaScriptAstNode): void;
    validateBlockStatement(node: JavaScriptAstNode): void;
    validateArrowFunction(node: JavaScriptAstNode): void;
    validateTemplateLiteral(node: JavaScriptAstNode): void;
    validateClass(node: JavaScriptAstNode): void;
    validateMethodDefinition(node: JavaScriptAstNode): void;
    validateAsyncFunction(node: JavaScriptAstNode): void;
    validateObjectExpression(node: JavaScriptAstNode): void;
    validateProperty(node: JavaScriptAstNode): void;
    validateImport(node: JavaScriptAstNode): void;
    validateExport(node: JavaScriptAstNode): void;
    validateInlineConstant(node: JavaScriptAstNode): void;
    validateIdentifier(node: JavaScriptAstNode): void;
    validateLiteral(node: JavaScriptAstNode): void;
}
export {};
//# sourceMappingURL=JavaScriptAstValidator.d.ts.map