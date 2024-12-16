import { JSASTNode } from "../ast";
export type ValidationError = {
    code: string;
    message: string;
    node: JSASTNode;
};
export type NodeType = "Program" | "VariableDeclaration" | "InlineConstant" | "Identifier" | "Literal" | "BlockStatement" | "ArrowFunction" | "TemplateLiteral" | "TemplateLiteralExpression" | "ClassDeclaration" | "MethodDefinition" | "PropertyDefinition" | "FunctionExpression" | "AsyncFunction" | "ObjectExpression" | "Property" | "SpreadElement" | "ImportDeclaration" | "ExportDeclaration";
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