
interface ValidationError {
  code: string;
  message: string;
  node: JavaScriptAstNode;
}


  export type JavaScriptAstNode = {
    type: string;
    value?: string;
    children?: JavaScriptAstNode[];
  };


export class JavaScriptAstValidator {
  public errors: ValidationError[];

  constructor() {
    this.errors = [];
  }

  public validate(ast: JavaScriptAstNode): ValidationError[] {
    this.errors = [];
    this.traverse(ast);
    return this.errors;
  }

  public addError(code: string, message: string, node: JavaScriptAstNode): void {
    this.errors.push({ code, message, node });
  };

  public traverse(node: JavaScriptAstNode): void {
    const validNodeTypes: string[] = [
      "Program", "VariableDeclaration", "InlineConstant", "Identifier", 
      "ArrowFunction", "Literal", "BlockStatement", "TemplateLiteral",
      "TemplateLiteralExpression", "ClassDeclaration", "MethodDefinition",
      "PropertyDefinition", "FunctionExpression", "AsyncFunction",
      "ObjectExpression", "Property", "SpreadElement", "ExportDeclaration",
      "ExportNamedDeclaration", "ReturnStatement", "IfStatement", "Expression",
      "BinaryExpression", "FunctionDeclaration", "Whitespace", "Comment",
      "ImportDeclaration"
    ];


    if (!validNodeTypes.includes(node.type)) {
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
  
  }
}

  public validateProgram(node: JavaScriptAstNode): void {
    // Program nodes can be empty, no validation needed
      
  }


  public validateVariableDeclaration(node: JavaScriptAstNode): void {
    if (!node.children?.length) {
      this.addError("E004", "Invalid VariableDeclaration: insufficient children.", node);
    }

    if (!node.value || !["let", "const", "var"].includes(node.value)) {
      this.addError("E005", "Invalid VariableDeclaration: invalid kind.", node);
    }
  }

  public validateBlockStatement(node: JavaScriptAstNode): void {
    // Block statements can be empty, no validation needed
  }

  public validateArrowFunction(node: JavaScriptAstNode): void {
    if (!node.children?.length) {
      this.addError("E006", "ArrowFunction must have a body.", node);
    }
  }

  public validateTemplateLiteral(node: JavaScriptAstNode): void {
    // Template literals can be empty, no validation needed
  }

  public validateClass(node: JavaScriptAstNode): void {
    if (!node.value) {
      this.addError("E015", "Class declaration must have a name.", node);
    }
  }

  public validateMethodDefinition(node: JavaScriptAstNode): void {
    if (!node.value) {
      this.addError("E016", "Class method must have a name.", node);
    }
  }

  public validateAsyncFunction(node: JavaScriptAstNode): void {
    if (!node.children?.length) {
      this.addError("E019", "Async function must have a body.", node);
    }
  }

  public validateObjectExpression(node: JavaScriptAstNode): void {
    const properties = new Set<string>();
    
    node.children?.forEach((prop: JavaScriptAstNode) => {
      if (prop.type === "Property" && prop.value) {
        if (properties.has(prop.value)) {
          this.addError("E010", `Duplicate key '${prop.value}' in object literal.`, prop);
        }
        properties.add(prop.value);
      }
    });
  }

  public validateProperty(node: JavaScriptAstNode): void {
    if (!node.value) {
      this.addError("E011", "Property must have a name.", node);
    }
  }

  public validateImport(node: JavaScriptAstNode): void {
    if (!node.children?.length) {
      this.addError("E021", "Import declaration must specify imported values.", node);
    }
  }

  public validateExport(node: JavaScriptAstNode): void {
    if (!node.children?.length && !node.value) {
      this.addError("E022", "Export declaration must have exported values.", node);
    }
  }

  public validateInlineConstant(node: JavaScriptAstNode): void {
    if (!node.value) {
      this.addError("E024", "InlineConstant must have a value.", node);
    }
  }

  public validateIdentifier(node: JavaScriptAstNode): void {
    if (!node.value || !/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(node.value)) {
      this.addError("E025", `Invalid identifier name: ${node.value}`, node);
    }
  }



public validateLiteral(node: JavaScriptAstNode): void {
  if (node.value === undefined || node.value === null) {
    this.addError("E026", "Literal must have a value.", node);
  }

}



    }