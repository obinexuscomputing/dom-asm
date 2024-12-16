export enum NodeType {
  Program = 'Program',
  Statement = 'Statement',
  Expression = 'Expression',
  VariableDeclaration = 'VariableDeclaration',
  BinaryExpression = 'BinaryExpression',
  Identifier = 'Identifier',
  Literal = 'Literal',
  BlockStatement = 'BlockStatement',
  IfStatement = 'IfStatement',
  ArrowFunction = 'ArrowFunction',
  TemplateLiteral = 'TemplateLiteral',
  ClassDeclaration = 'ClassDeclaration',
  MethodDefinition = 'MethodDefinition',
  ObjectExpression = 'ObjectExpression',
  Property = 'Property',
  ImportDeclaration = 'ImportDeclaration',
  ExportDeclaration = 'ExportDeclaration',
  InlineConstant = 'InlineConstant',
  FunctionDeclaration = 'FunctionDeclaration',
  ReturnStatement = 'ReturnStatement',
}

export enum JSTokenType {
  Keyword = 'Keyword',
  Identifier = 'Identifier',
  Operator = 'Operator',
  Delimiter = 'Delimiter',
  Literal = 'Literal',
  EndOfStatement = 'EndOfStatement',
}

export interface JSToken {
  type: JSTokenType;
  value: string;
  line?: number;
  column?: number;
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
  type: NodeType;
}

export interface ValidationError {
  code: string;
  message: string;
  node: JSASTNode;
}

export interface ParseOptions {
  sourceType?: 'module' | 'script';
  strict?: boolean;
}

export const Types = { NodeType, JSTokenType };
