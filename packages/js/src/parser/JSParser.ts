import { TypedJSASTNode, NodeType, JSToken } from "../types";



export class JSParser {
 
   public parse(ast: TypedJSASTNode): string | string[] | null {
     switch (ast.type) {
       case NodeType.Program:
         return this.parseProgram(ast);
       case NodeType.Statement:
         return this.parseStatement(ast);
       case NodeType.Expression:
         return this.parseExpression(ast);
       case NodeType.VariableDeclaration:
         return this.parseVariableDeclaration(ast);
       case NodeType.InlineConstant:
         return this.parseInlineConstant(ast);
       case NodeType.BinaryExpression:
         return this.parseBinaryExpression(ast);
       case NodeType.BlockStatement:
         return this.parseBlockStatement(ast);
       case NodeType.IfStatement:
         return this.parseIfStatement(ast);
       case NodeType.FunctionDeclaration:
         return this.parseFunctionDeclaration(ast);
       case NodeType.ReturnStatement:
         return this.parseReturnStatement(ast);
       default:
         return ast.value || "";
     }
   }
 
   private parseProgram(node: TypedJSASTNode): string[] {
     return node.children?.map((child) => this.parse(child) as string).filter(Boolean) ?? [];
   }
 
   private parseStatement(node: TypedJSASTNode): string {
     return node.children?.map((child) => this.parse(child)).join("; ") + ";";
   }
 
   private parseExpression(node: TypedJSASTNode): string {
     return node.children?.map((child) => this.parse(child)).join(" ") ?? "";
   }
 
   private parseVariableDeclaration(node: TypedJSASTNode): string {
     const [identifier, value] = node.children ?? [];
     return `${node.value} ${this.parse(identifier as TypedJSASTNode)} = ${this.parse(
       value as TypedJSASTNode
     )};`;
   }
 
   private parseInlineConstant(node: TypedJSASTNode): string {
     return `${node.value}`;
   }
 
   private parseBinaryExpression(node: TypedJSASTNode): string {
     if (node.children?.length === 2) {
       const [left, right] = node.children;
       return `${this.parse(left as TypedJSASTNode)} ${node.value} ${this.parse(right as TypedJSASTNode)}`;
     }
     return "";
   }
 
   private parseBlockStatement(node: TypedJSASTNode): string {
     const body = node.children?.map((child) => this.parse(child)).join("\n");
     return `{\n${body}\n}`;
   }
 
   private parseIfStatement(node: TypedJSASTNode): string {
     const [condition, consequence, alternate] = node.children ?? [];
     const ifPart = `if (${this.parse(condition as TypedJSASTNode)}) ${this.parse(
       consequence as TypedJSASTNode
     )}`;
     const elsePart = alternate ? ` else ${this.parse(alternate as TypedJSASTNode)}` : "";
     return `${ifPart}${elsePart}`;
   }
 
   private parseFunctionDeclaration(node: TypedJSASTNode): string {
     const [identifier, ...paramsAndBody] = node.children ?? [];
     const params = paramsAndBody.slice(0, paramsAndBody.length - 1).map((param) => this.parse(param));
     const body = this.parse(paramsAndBody[paramsAndBody.length - 1] as TypedJSASTNode);
     return `function ${this.parse(identifier as TypedJSASTNode)}(${params.join(", ")}) ${body}`;
   }
 
   private parseReturnStatement(node: TypedJSASTNode): string {
     return `return ${this.parse(node.children?.[0] as TypedJSASTNode)};`;
   }
   
public buildASTFromTokens(tokens: JSToken[]): TypedJSASTNode {
  // Convert tokens into a TypedJSASTNode (mock implementation for illustration)
  return {
    type: NodeType.Program,
    children: tokens.map((token) => ({
      type: NodeType[token.type as keyof typeof NodeType] || NodeType.Literal,
      value: token.value,
      line: token.line,
      column: token.column,
    })),
  } as TypedJSASTNode;
}

}