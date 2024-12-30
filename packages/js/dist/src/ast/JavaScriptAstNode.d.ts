export declare enum JavaScriptNodeTypeMap {
    Program = "Program",
    VariableDeclaration = "VariableDeclaration",
    InlineConstant = "InlineConstant",
    Identifier = "Identifier",
    Literal = "Literal",
    BlockStatement = "BlockStatement",
    ArrowFunction = "ArrowFunction",
    TemplateLiteral = "TemplateLiteral",
    TemplateLiteralExpression = "TemplateLiteralExpression",
    ClassDeclaration = "ClassDeclaration",
    MethodDefinition = "MethodDefinition",
    PropertyDefinition = "PropertyDefinition",
    FunctionExpression = "FunctionExpression",
    AsyncFunction = "AsyncFunction",
    ObjectExpression = "ObjectExpression",
    Property = "Property",
    SpreadElement = "SpreadElement",
    ImportDeclaration = "ImportDeclaration",
    ExportDeclaration = "ExportDeclaration",
    ReturnStatement = "ReturnStatement",
    Statement = "Statement",
    Expression = "Expression",
    BinaryExpression = "BinaryExpression",
    IfStatement = "IfStatement",
    FunctionDeclaration = "FunctionDeclaration",
    Whitespace = "Whitespace",
    Comment = "Comment",
    ExportNamedDeclaration = "ExportNamedDeclaration"
}
export interface JavaScriptAstNode {
    type: JavaScriptNodeTypeMap;
    value?: string;
    children?: JavaScriptAstNode[];
    minimize(): JavaScriptAstNode;
}
export declare class JavaScriptAstNode {
    type: JavaScriptNodeTypeMap;
    value?: string;
    children?: JavaScriptAstNode[];
    constructor(type: JavaScriptNodeTypeMap, value?: string, children?: JavaScriptAstNode[]);
    optimize(): JavaScriptAstNode;
    traverse(node: JavaScriptAstNode, optimize?: boolean): JavaScriptAstNode;
    performOptimization(node: JavaScriptAstNode): JavaScriptAstNode;
    simplifyNode(node: JavaScriptAstNode): JavaScriptAstNode;
    toString(): string;
}
//# sourceMappingURL=JavaScriptAstNode.d.ts.map