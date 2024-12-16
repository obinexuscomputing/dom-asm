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
}

// JSTokenType Enum
export enum JSTokenType {
  Keyword = 'Keyword',
  Identifier = 'Identifier',
  Operator = 'Operator',
  Delimiter = 'Delimiter',
  Literal = 'Literal',
}

// Token Interface
export interface JSToken {
  type: JSTokenType;
  value: string;
  line?: number;
  column?: number;
}

// AST Node Interfaces
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

// Parser Options
export interface ParseOptions {
  sourceType?: 'module' | 'script';
  strict?: boolean;
}

// Default Export Object
const Types = { NodeType, JSTokenType };
export default Types;

// Individual Type Exports
// export type { JSToken, BaseNode, JSASTNode, ParseOptions };
