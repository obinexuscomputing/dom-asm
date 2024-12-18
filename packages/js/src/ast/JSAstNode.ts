// Define the NodeType enum
export enum NodeType {
    Program = 'Program',
    VariableDeclaration = 'VariableDeclaration',
    InlineConstant = 'InlineConstant',
    Identifier = 'Identifier',
    Literal = 'Literal',
    BlockStatement = 'BlockStatement',
    ArrowFunction = 'ArrowFunction',
    TemplateLiteral = 'TemplateLiteral',
    TemplateLiteralExpression = 'TemplateLiteralExpression',
    ClassDeclaration = 'ClassDeclaration',
    MethodDefinition = 'MethodDefinition',
    PropertyDefinition = 'PropertyDefinition',
    FunctionExpression = 'FunctionExpression',
    AsyncFunction = 'AsyncFunction',
    ObjectExpression = 'ObjectExpression',
    Property = 'Property',
    SpreadElement = 'SpreadElement',
    ImportDeclaration = 'ImportDeclaration',
    ExportDeclaration = 'ExportDeclaration',
    ReturnStatement = 'ReturnStatement',
    Statement = 'Statement',
    Expression = 'Expression',
    BinaryExpression = 'BinaryExpression',
    IfStatement = 'IfStatement',
    FunctionDeclaration = 'FunctionDeclaration'
}


// Define the JSAstNode class
export class JSAstNode {
    public type: NodeType;
    public value?: string;
    public children?: JSAstNode[];

    constructor(type: NodeType, value?: string, children?: JSAstNode[]) {
        this.type = type;
        this.value = value;
        this.children = children;
    }

    public minimize(): JSAstNode {
        // Implement minimization logic here
        // For example, remove unnecessary whitespace nodes, comments, etc.
        if (this.children) {
            this.children = this.children.map(child => child.minimize()).filter(child => child.type !== NodeType.Whitespace && child.type !== NodeType.Comment);
        }
        return this;
    }
}
