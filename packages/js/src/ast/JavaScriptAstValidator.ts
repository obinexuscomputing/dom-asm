



import { JavaScriptAstNode, NodeType } from './JSASTNode';

interface ValidationError {
  code: string;
  message: string;
  node: JavaScriptAstNode;
}
import { JavaScriptAstNode, NodeType } from './JSASTNode';

interface ValidationError {
  code: string;
  message: string;
  node: JavaScriptAstNode;
}

export class JavaScriptAstValidator {
  private errors: ValidationError[];

  constructor() {
    this.errors = [];
  }

  public validate(ast: JavaScriptAstNode): ValidationError[] {
    this.errors = [];
    this.traverse(ast);
    return this.errors;
  }

  private addError(code: string, message: string, node: JavaScriptAstNode): void {
    this.errors.push({ code, message, node });
  }

  private traverse(node: JavaScriptAstNode): void {
    const validNodeTypes: NodeType[] = [
      "Program", "VariableDeclaration", "InlineConstant", "Identifier", 
      "Literal", "BlockStatement", "ArrowFunction", "TemplateLiteral",
      "TemplateLiteralExpression", "ClassDeclaration", "MethodDefinition",
      "PropertyDefinition", "FunctionExpression", "AsyncFunction",
      "ObjectExpression", "Property", "SpreadElement", "ImportDeclaration",
      "ExportDeclaration"
    ];

    if (!validNodeTypes.includes(node.type as NodeType)) {
      this.addError("E001", `Unknown node type: ${node.type}`, node);
      return;
    }

    switch (node.type) {
      case "Program":
        this.validateProgram(node);
        break;
      case "VariableDeclaration":
        this.validateVariableDeclaration(node);
        break;
      case "BlockStatement":
        this.validateBlockStatement(node);
        break;
      case "ArrowFunction":
        this.validateArrowFunction(node);
        break;
      case "TemplateLiteral":
        this.validateTemplateLiteral(node);
        break;
      case "ClassDeclaration":
        this.validateClass(node);
        break;
      case "MethodDefinition":
        this.validateMethodDefinition(node);
        break;
      case "AsyncFunction":
        this.validateAsyncFunction(node);
        break;
      case "ObjectExpression":
        this.validateObjectExpression(node);
        break;
      case "Property":
        this.validateProperty(node);
        break;
      case "ImportDeclaration":
        this.validateImport(node);
        break;
      case "ExportDeclaration":
        this.validateExport(node);
        break;
      case "InlineConstant":
        this.validateInlineConstant(node);
        break;
  private validateProgram(node: JavaScriptAstNode): void {
    if (node.children) {
      for (const child of node.children) {
        this.traverse(child);
      }
    }
  }

  private validateVariableDeclaration(node: JavaScriptAstNode): void {
    if (!node.children?.length) {
      this.addError("E004", "Invalid VariableDeclaration: insufficient children.", node);
    }

    if (!node.value || !["let", "const", "var"].includes(node.value)) {
      this.addError("E005", "Invalid VariableDeclaration: invalid kind.", node);
    }
  }

  private validateBlockStatement(node: JavaScriptAstNode): void {
    // Block statements can be empty, no validation needed
  }

  private validateArrowFunction(node: JavaScriptAstNode): void {
    if (!node.children?.length) {
      this.addError("E006", "ArrowFunction must have a body.", node);
    }
  }

  private validateTemplateLiteral(node: JavaScriptAstNode): void {
    // Template literals can be empty, no validation needed
  }

  private validateClass(node: JavaScriptAstNode): void {
    if (!node.value) {
      this.addError("E015", "Class declaration must have a name.", node);
    }
  }

  private validateMethodDefinition(node: JavaScriptAstNode): void {
    if (!node.value) {
      this.addError("E016", "Class method must have a name.", node);
    }
  }

  private validateAsyncFunction(node: JavaScriptAstNode): void {
    if (!node.children?.length) {
      this.addError("E019", "Async function must have a body.", node);
    }
  }

  private validateObjectExpression(node: JavaScriptAstNode): void {
    const properties = new Set<string>();
    
    node.children?.forEach(prop => {
      if (prop.type === "Property" && prop.value) {
        if (properties.has(prop.value)) {
          this.addError("E010", `Duplicate key '${prop.value}' in object literal.`, prop);
        }
        properties.add(prop.value);
      }
    });
  }

  private validateProperty(node: JavaScriptAstNode): void {
    if (!node.value) {
      this.addError("E011", "Property must have a name.", node);
    }
  }

  private validateImport(node: JavaScriptAstNode): void {
    if (!node.children?.length) {
      this.addError("E021", "Import declaration must specify imported values.", node);
    }
  }

  private validateExport(node: JavaScriptAstNode): void {
    if (!node.children?.length && !node.value) {
      this.addError("E022", "Export declaration must have exported values.", node);
    }
  }

  private validateInlineConstant(node: JavaScriptAstNode): void {
    if (!node.value) {
      this.addError("E024", "InlineConstant must have a value.", node);
    }
  }

  private validateIdentifier(node: JavaScriptAstNode): void {
    if (!node.value || !/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(node.value)) {
      this.addError("E025", `Invalid identifier name: ${node.value}`, node);
    }
  }

  private validateLiteral(node: JavaScriptAstNode): void {
    if (!node.value) {
      this.addError("E026", "Literal must have a value.", node);
    }
  }
} }

  private validateLiteral(node: JSASTNode): void {
    if (!node.value) {
      this.addError("E026", "Literal must have a value.", node);
    }
  }
}