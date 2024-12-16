import { JSASTNode } from "../ast";

export type ValidationError = {
  code: string;
  message: string;
  node: JSASTNode;
};

export type NodeType = 
  | "Program"
  | "VariableDeclaration"
  | "InlineConstant"
  | "Identifier"
  | "Literal"
  | "BlockStatement"
  | "ArrowFunction"
  | "TemplateLiteral"
  | "TemplateLiteralExpression"
  | "ClassDeclaration"
  | "MethodDefinition"
  | "PropertyDefinition"
  | "FunctionExpression"
  | "AsyncFunction"
  | "ObjectExpression"
  | "Property"
  | "SpreadElement"
  | "ImportDeclaration"
  | "ExportDeclaration";

export class JSValidator {
  private errors: ValidationError[];

  constructor() {
    this.errors = [];
  }

  public validate(ast: JSASTNode): ValidationError[] {
    this.errors = [];
    this.traverse(ast);
    return this.errors;
  }

  private addError(code: string, message: string, node: JSASTNode): void {
    this.errors.push({ code, message, node });
  }

  private traverse(node: JSASTNode): void {
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
      case "Identifier":
        this.validateIdentifier(node);
        break;
      case "Literal":
        this.validateLiteral(node);
        break;
    }

    if (node.children) {
      for (const child of node.children) {
        this.traverse(child);
      }
    }
  }

  private validateProgram(node: JSASTNode): void {
    if (!node.children?.length) {
      this.addError("E002", "Program must contain at least one statement.", node);
    }
  }

  private validateVariableDeclaration(node: JSASTNode): void {
    if (!node.children?.length) {
      this.addError("E004", "Invalid VariableDeclaration: insufficient children.", node);
      return;
    }

    if (!node.value || !["let", "const", "var"].includes(node.value)) {
      this.addError("E005", "Variable declaration must specify kind (let, const, or var).", node);
    }
  }

  private validateBlockStatement(node: JSASTNode): void {
    // Block statements can be empty, no validation needed
  }

  private validateArrowFunction(node: JSASTNode): void {
    if (!node.children?.length) {
      this.addError("E007", "Arrow function must have a body.", node);
    }
  }

  private validateTemplateLiteral(node: JSASTNode): void {
    // Template literals can be empty, no validation needed
  }

  private validateClass(node: JSASTNode): void {
    if (!node.value) {
      this.addError("E015", "Class declaration must have a name.", node);
    }
  }

  private validateMethodDefinition(node: JSASTNode): void {
    if (!node.value) {
      this.addError("E016", "Class method must have a name.", node);
    }
  }

  private validateAsyncFunction(node: JSASTNode): void {
    if (!node.children?.some(child => child.type === "BlockStatement")) {
      this.addError("E019", "Async function must have a body.", node);
    }
  }

  private validateObjectExpression(node: JSASTNode): void {
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

  private validateProperty(node: JSASTNode): void {
    if (!node.value) {
      this.addError("E011", "Property must have a name.", node);
    }
  }

  private validateImport(node: JSASTNode): void {
    if (!node.children?.length) {
      this.addError("E021", "Import declaration must specify imported values.", node);
    }
  }

  private validateExport(node: JSASTNode): void {
    if (!node.children?.length && !node.value) {
      this.addError("E022", "Export declaration must have exported values.", node);
    }
  }

  private validateInlineConstant(node: JSASTNode): void {
    if (!node.value) {
      this.addError("E024", "InlineConstant must have a value.", node);
    }
  }

  private validateIdentifier(node: JSASTNode): void {
    if (!node.value || !/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(node.value)) {
      this.addError("E025", `Invalid identifier name: ${node.value}`, node);
    }
  }

  private validateLiteral(node: JSASTNode): void {
    if (!node.value) {
      this.addError("E026", "Literal must have a value.", node);
    }
  }
}