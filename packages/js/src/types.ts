// src/types.ts

// Common Node Types
export enum NodeType {
  // Program Structure
  Program = 'Program',
  Statement = 'Statement',
  Expression = 'Expression',

  // Variables and Declarations
  VariableDeclaration = 'VariableDeclaration',
  InlineConstant = 'InlineConstant',
  BinaryExpression = 'BinaryExpression',
  Identifier = 'Identifier',
  Literal = 'Literal',

  // Functions
  FunctionDeclaration = 'FunctionDeclaration',
  ReturnStatement = 'ReturnStatement',
  IfStatement = 'IfStatement',
  BlockStatement = 'BlockStatement',
  ArrowFunction = 'ArrowFunction',
  AsyncFunction = 'AsyncFunction',
  FunctionExpression = 'FunctionExpression',

  // Classes and Objects
  ClassDeclaration = 'ClassDeclaration',
  MethodDefinition = 'MethodDefinition',
  PropertyDefinition = 'PropertyDefinition',
  ObjectExpression = 'ObjectExpression',
  Property = 'Property',
  SpreadElement = 'SpreadElement',

  // Templates and Literals
  TemplateLiteral = 'TemplateLiteral',
  TemplateLiteralExpression = 'TemplateLiteralExpression',

  // Modules
  ImportDeclaration = 'ImportDeclaration',
  ExportDeclaration = 'ExportDeclaration'
}

// Tokenizer Types
export enum JSTokenType {
  Keyword = 'Keyword',
  Identifier = 'Identifier',
  Operator = 'Operator',
  Delimiter = 'Delimiter',
  Literal = 'Literal',
  TemplateLiteral = 'TemplateLiteral',
  Comment = 'Comment',
  EndOfStatement = 'EndOfStatement'
}

export interface JSToken {
  type: JSTokenType;
  value: string;
  line?: number;
  column?: number;
}
// AST Node Types
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
  children?: TypedJSASTNode[];
}

// Validator Types
export interface ValidationError {
  code: string;
  message: string;
  node: JSASTNode;
}

// Parser Types
export interface ParseOptions {
  sourceType?: 'module' | 'script';
  strict?: boolean;
}

// Export enums only in default export since they are both types and values
export default {
  NodeType,
  JSTokenType
};

// Type exports are handled by the individual interface/type declarations above