// NodeType Enum
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

// JSTokenType Enum
export enum JSTokenType {
  Keyword = 'Keyword',
  Identifier = 'Identifier',
  Operator = 'Operator',
  Delimiter = 'Delimiter',
  Literal = 'Literal',
  EndOfStatement = 'EndOfStatement',
}

// Token Interface
export interface JSToken {
  type: JSTokenType;
  value: string;
  line?: number;
  column?: number;
}

// BaseNode Interface for AST Nodes
export interface BaseNode {
  type: NodeType;
  value?: string;
  children?: BaseNode[];
  line?: number;
  column?: number;
}

// JSASTNode Interface for JavaScript-Specific AST
export interface JSASTNode extends BaseNode {
  children?: JSASTNode[];
}

// TypedJSASTNode Interface for Strict Typing
export interface TypedJSASTNode extends JSASTNode {
  type: NodeType;
  children?: TypedJSASTNode[];
}

// ValidationError Interface
export interface ValidationError {
  code: string;
  message: string;
  node: JSASTNode;
}

// ParseOptions Interface
export interface ParseOptions {
  sourceType?: 'module' | 'script';
  strict?: boolean;
}

// Export enums for runtime access
const Types = { NodeType, JSTokenType };
export default Types;

// Export types for type-checking
// export type { JSToken, BaseNode, JSASTNode, TypedJSASTNode, ValidationError, ParseOptions };
