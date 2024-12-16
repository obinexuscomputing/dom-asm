export enum NodeType {
    Program = 'Program',
    Statement = 'Statement',
    Expression = 'Expression',
    VariableDeclaration = 'VariableDeclaration',
    InlineConstant = 'InlineConstant',
    BinaryExpression = 'BinaryExpression',
    Identifier = 'Identifier',
    Literal = 'Literal',
    FunctionDeclaration = 'FunctionDeclaration',
    ReturnStatement = 'ReturnStatement',
    IfStatement = 'IfStatement',
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
    ExportDeclaration = 'ExportDeclaration'
  }
  
  export interface BaseNode {
    type: NodeType;
    value?: string;
    children?: BaseNode[];
    line?: number;
    column?: number;
  }
  
  export interface JSASTNode extends BaseNode {
    children?: JSASTNode[];
  }
  
  export interface TypedJSASTNode extends JSASTNode {
    children?: TypedJSASTNode[];
  }
  
  // Export all types from this file
  export { JSASTNode as default };