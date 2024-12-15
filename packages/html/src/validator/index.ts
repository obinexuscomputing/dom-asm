
import { ASTNode } from "../ast";


/**
 * import { HTMLTokenizer } from "./tokenizer/index";
import { AST } from "./ast/index";
import { Validator } from "./validator/index";

const htmlInput = `
<html:html>
  <html:head>
    <html:title>Sample HTML6 Document</html:title>
  </html:head>
  <html:body>
    <html:media src="logo.png" type="image" />
    <html:p>This is a sample document.</html:p>
    <invalid:tag>Oops!</invalid:tag>
  </html:body>
</html:html>
`;

const tokenizer = new HTMLTokenizer(htmlInput);
const tokens = tokenizer.tokenize();

const astBuilder = new AST();
const ast = astBuilder.buildAST(tokens);

const validator = new Validator();
const validationResult = validator.validateAST(ast);

if (validationResult.valid) {
  console.log("The document is valid.");
} else {
  console.error("Validation errors:");
  validationResult.errors.forEach((error) => console.error(error));
}

 */



type ValidationResult = {
  valid: boolean;
  errors: string[];
};

class HTMLValidator {
  private namespaceRules: Record<string, string[]> = {
    "html": ["html", "head", "body", "title", "meta", "link", "p", "div", "a", "img", "media"],
  };

  private attributeRules: Record<string, string[]> = {
    "html:a": ["href", "title"],
    "html:img": ["src", "alt", "width", "height"],
    "html:media": ["src", "type", "controls", "autostart"],
  };

  private validationCache: Map<string, ValidationResult> = new Map();

  public registerNamespace(namespace: string, tags: string[]): void {
    this.namespaceRules[namespace] = tags;
  }

  public registerAttributes(tag: string, attributes: string[]): void {
    this.attributeRules[tag] = attributes;
  }

  public validateAST(ast: ASTNode): ValidationResult {
    const cacheKey = this.getCacheKey(ast);
    if (this.validationCache.has(cacheKey)) {
      return this.validationCache.get(cacheKey)!;
    }

    const errors: string[] = [];
    this.traverseAST(ast, errors);

    const result = { valid: errors.length === 0, errors };
    this.validationCache.set(cacheKey, result);
    return result;
  }

  private traverseAST(node: ASTNode, errors: string[]): void {
    if (node.type === "Element") {
      this.validateElement(node, errors);
    }

    for (const child of node.children) {
      this.traverseAST(child, errors);
    }
  }

  private validateElement(node: ASTNode, errors: string[]): void {
    if (!node.name) return;

    const [namespace, tagName] = node.name.split(":");
    if (!this.namespaceRules[namespace]) {
      errors.push(`Unknown namespace: ${namespace} in <${node.name}>`);
    } else if (!this.namespaceRules[namespace].includes(tagName)) {
      errors.push(`Invalid tag <${node.name}> in namespace ${namespace}`);
    }

    if (node.attributes) {
      for (const [attr, value] of Object.entries(node.attributes)) {
        const validAttributes = this.attributeRules[node.name] || [];
        if (!validAttributes.includes(attr)) {
          errors.push(`Invalid attribute "${attr}" on <${node.name}>`);
        }
      }
    }
  }

  private getCacheKey(node: ASTNode): string {
    return JSON.stringify(node, (key, value) =>
      key === "parent" ? undefined : value // Exclude parent references to avoid circular structure
    );
  }
}

export { HTMLValidator, ValidationResult };
