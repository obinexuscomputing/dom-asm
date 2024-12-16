import { JSASTNode } from "../ast";

export type ValidationError = {
  code: string;
  message: string;
  node: JSASTNode;
};

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
    switch (node.type) {
      case "Program":
        this.validateProgram(node);
        break;
      case "VariableDeclaration":
        this.validateVariableDeclaration(node);
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
      case "ArrowFunction":
        this.validateArrowFunction(node);
        break;
      case "TemplateLiteral":
        this.validateTemplateLiteral(node);
        break;
      case "ObjectExpression":
        this.validateObjectExpression(node);
        break;
      case "ArrayExpression":
        this.validateArrayExpression(node);
        break;
      case "SpreadElement":
        this.validateSpreadElement(node);
        break;
      case "DestructuringPattern":
        this.validateDestructuring(node);
        break;
      case "ImportDeclaration":
        this.validateImport(node);
        break;
      case "ExportDeclaration":
        this.validateExport(node);
        break;
      case "ClassDeclaration":
        this.validateClass(node);
        break;
      case "AsyncFunction":
        this.validateAsyncFunction(node);
        break;
      case "AwaitExpression":
        this.validateAwaitExpression(node);
        break;
      default:
        this.addError("E001", `Unknown node type: ${node.type}`, node);
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

    // Check for multiple export defaults
    const defaultExports = node.children?.filter(
      child => child.type === "ExportDeclaration" && child.value === "default"
    );
    if (defaultExports && defaultExports.length > 1) {
      this.addError("E003", "Multiple default exports are not allowed.", node);
    }
  }

  private validateVariableDeclaration(node: JSASTNode): void {
    if (!node.children?.length) {
      this.addError("E004", "Invalid VariableDeclaration: insufficient children.", node);
      return;
    }

    // Check kind of declaration (let, const, var)
    if (!node.value || !["let", "const", "var"].includes(node.value)) {
      this.addError("E005", "Variable declaration must specify kind (let, const, or var).", node);
    }

    // Handle destructuring patterns
    const identifier = node.children[0];
    if (identifier.type === "DestructuringPattern") {
      this.validateDestructuring(identifier);
    } else if (identifier.type !== "Identifier") {
      this.addError("E006", "VariableDeclaration must have a valid identifier or destructuring pattern.", node);
    }
  }

  private validateArrowFunction(node: JSASTNode): void {
    if (!node.children?.length) {
      this.addError("E007", "Arrow function must have a body.", node);
      return;
    }

    // Validate params
    const params = node.children[0];
    if (params.type === "DestructuringPattern") {
      this.validateDestructuring(params);
    }

    // Check for valid body
    const body = node.children[node.children.length - 1];
    if (!body || (body.type !== "BlockStatement" && body.type !== "Expression")) {
      this.addError("E008", "Arrow function must have a valid body.", node);
    }
  }

  private validateTemplateLiteral(node: JSASTNode): void {
    node.children?.forEach(expression => {
      if (expression.type === "TemplateLiteralExpression") {
        if (!expression.value && !expression.children?.length) {
          this.addError("E009", "Template literal expression must not be empty.", expression);
        }
      }
    });
  }

  private validateObjectExpression(node: JSASTNode): void {
    const properties = new Set<string>();
    
    node.children?.forEach(prop => {
      // Check for duplicate keys in object literals
      if (prop.type === "Property" && prop.value) {
        if (properties.has(prop.value)) {
          this.addError("E010", `Duplicate key '${prop.value}' in object literal.`, prop);
        }
        properties.add(prop.value);
      }

      // Validate shorthand and computed properties
      if (prop.type === "Property") {
        this.validateProperty(prop);
      }
    });
  }

  private validateProperty(node: JSASTNode): void {
    if (node.value === "computed" && !node.children?.length) {
      this.addError("E011", "Computed property name must have an expression.", node);
    }

    if (node.value === "method" && !node.children?.find(child => child.type === "FunctionExpression")) {
      this.addError("E012", "Method property must have a function expression.", node);
    }
  }

  private validateDestructuring(node: JSASTNode): void {
    if (!node.children?.length) {
      this.addError("E013", "Destructuring pattern must not be empty.", node);
      return;
    }

    // Check for valid default values
    node.children.forEach(child => {
      if (child.type === "AssignmentPattern") {
        if (!child.children?.length) {
          this.addError("E014", "Destructuring assignment must have a default value.", child);
        }
      }
    });
  }

  private validateClass(node: JSASTNode): void {
    if (!node.value) {
      this.addError("E015", "Class declaration must have a name.", node);
    }

    // Validate class methods and properties
    node.children?.forEach(child => {
      if (child.type === "MethodDefinition") {
        this.validateMethodDefinition(child);
      } else if (child.type === "PropertyDefinition") {
        this.validatePropertyDefinition(child);
      }
    });
  }

  private validateMethodDefinition(node: JSASTNode): void {
    if (!node.value) {
      this.addError("E016", "Class method must have a name.", node);
    }

    if (node.value === "constructor" && node.children?.find(child => child.type === "AsyncFunction")) {
      this.addError("E017", "Constructor cannot be async.", node);
    }
  }

  private validatePropertyDefinition(node: JSASTNode): void {
    if (!node.value && !node.children?.find(child => child.type === "ComputedPropertyName")) {
      this.addError("E018", "Class property must have a name or be computed.", node);
    }
  }

  private validateAsyncFunction(node: JSASTNode): void {
    if (!node.children?.find(child => child.type === "BlockStatement")) {
      this.addError("E019", "Async function must have a body.", node);
    }
  }

  private validateAwaitExpression(node: JSASTNode): void {
    if (!node.children?.length) {
      this.addError("E020", "Await expression must have an argument.", node);
    }
  }

  private validateImport(node: JSASTNode): void {
    if (!node.children?.length) {
      this.addError("E021", "Import declaration must specify imported values or module.", node);
    }
  }

  private validateExport(node: JSASTNode): void {
    if (!node.children?.length && !node.value) {
      this.addError("E022", "Export declaration must have exported values.", node);
    }
  }

  private validateSpreadElement(node: JSASTNode): void {
    if (!node.children?.length) {
      this.addError("E023", "Spread element must have an argument.", node);
    }
  }

  private validateArrayExpression(node: JSASTNode): void {
    // Validate array element types and spread usage
    node.children?.forEach(element => {
      if (element.type === "SpreadElement") {
        this.validateSpreadElement(element);
      }
    });
  }

  // Original validation methods enhanced with more specific error codes
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