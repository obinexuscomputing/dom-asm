
export class JavaScriptAstCodeGenerator {
  public generate(ast: JavaScriptAstNode): string {
    return this.generateNode(ast);
  }

  private generateNode(node: JavaScriptAstNode): string {
    switch (node.type) {
      case JavaScriptNodeTypeMap.Program:
        return this.generateProgram(node);
      case JavaScriptNodeTypeMap.VariableDeclaration:
        return this.generateVariableDeclaration(node);
      case JavaScriptNodeTypeMap.Identifier:
        return this.generateIdentifier(node);
      case JavaScriptNodeTypeMap.Literal:
        return this.generateLiteral(node);
      case JavaScriptNodeTypeMap.BlockStatement:
        return this.generateBlockStatement(node);
      case JavaScriptNodeTypeMap.IfStatement:
        return this.generateIfStatement(node);
      case JavaScriptNodeTypeMap.FunctionDeclaration:
        return this.generateFunctionDeclaration(node);
      default:
        throw new Error(`Unknown node type: ${node.type}`);
    }
  }

  private generateProgram(node: JavaScriptAstNode): string {
    return node.children?.map((child: JavaScriptAstNode) => this.generateNode(child)).join('\n') || '';
  }

  private generateVariableDeclaration(node: JavaScriptAstNode): string {
    const [identifier, initializer] = node.children!;
    return `${node.value} ${this.generateNode(identifier)} = ${this.generateNode(initializer)};`;
  }

  private generateIdentifier(node: JavaScriptAstNode): string {
    return node.value!;
  }

  private generateLiteral(node: JavaScriptAstNode): string {
    return node.value!;
  }

  private generateBlockStatement(node: JavaScriptAstNode): string {
    const body = node.children?.map((child: JavaScriptAstNode) => this.generateNode(child)).join('\n') || '';
    return `{${body}}`;
  }

  private generateIfStatement(node: JavaScriptAstNode): string {
    const [condition, consequence, alternate] = node.children!;
    let code = `if (${this.generateNode(condition)}) ${this.generateNode(consequence)}`;
    if (alternate) {
      code += ` else ${this.generateNode(alternate)}`;
    }
    return code;
  }

  private generateFunctionDeclaration(node: JavaScriptAstNode): string {
    const [identifier, ...paramsAndBody] = node.children!;
    const params: string = paramsAndBody.slice(0, -1).map((param: JavaScriptAstNode) => this.generateNode(param)).join(', ');
    const body = this.generateNode(paramsAndBody[paramsAndBody.length - 1]);
    return `function ${this.generateNode(identifier)}(${params}) ${body}`;
  }
}
