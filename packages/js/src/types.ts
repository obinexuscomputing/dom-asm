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
  ExportDeclaration = 'ExportDeclaration',
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
  EndOfStatement = 'EndOfStatement',
}

// Token Interface
export interface JSToken {
  type: JSTokenType;
  value: string;
  line?: number;
  column?: number;
}

// Base Node Interface
export interface BaseNode {
  type: NodeType;
  value?: string;
  children?: BaseNode[];
  line?: number;
  column?: number;
}

// Abstract Syntax Tree (AST) Node Interface
export interface JSASTNode extends BaseNode {
  children?: JSASTNode[];
}

// Typed AST Node Interface
export interface TypedJSASTNode extends JSASTNode {
  type: NodeType; // Redundant here but included for strict typing
  children?: TypedJSASTNode[];
}

// Validation Error Interface
export interface ValidationError {
  code: string;
  message: string;
  node: JSASTNode;
}

// Parser Options Interface
export interface ParseOptions {
  sourceType?: 'module' | 'script'; // Default is 'script' if not provided
  strict?: boolean; // Whether strict mode parsing is enabled
}

// Export enums and types together
const Types = {
  NodeType,
  JSTokenType,
};

export default Types; // Single export object for enums and runtime references

// Individual exports for types/interfaces
export type {
  JSToken,
  BaseNode,
  JSASTNode,
  TypedJSASTNode,
  ValidationError,
  ParseOptions,
};
