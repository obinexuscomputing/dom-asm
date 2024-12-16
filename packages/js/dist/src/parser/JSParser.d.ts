export type NodeType = "Program" | "Statement" | "Expression" | "VariableDeclaration" | "InlineConstant" | "BinaryExpression" | "Identifier" | "Literal" | "FunctionDeclaration" | "ReturnStatement" | "IfStatement" | "BlockStatement";
export interface TypedJSASTNode {
    type: NodeType;
    value?: string;
    children?: TypedJSASTNode[];
}
export declare class JSParser {
    parse(ast: TypedJSASTNode): string | string[] | null;
    private parseProgram;
    private parseStatement;
    private parseExpression;
    private parseVariableDeclaration;
    private parseInlineConstant;
    private parseBinaryExpression;
    private parseBlockStatement;
    private parseIfStatement;
    private parseFunctionDeclaration;
    private parseReturnStatement;
}
//# sourceMappingURL=JSParser.d.ts.map