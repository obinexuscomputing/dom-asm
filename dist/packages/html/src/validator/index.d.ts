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
declare class Validator {
    private namespaceRules;
    private attributeRules;
    private validationCache;
    registerNamespace(namespace: string, tags: string[]): void;
    registerAttributes(tag: string, attributes: string[]): void;
    validateAST(ast: ASTNode): ValidationResult;
    private traverseAST;
    private validateElement;
    private getCacheKey;
}
export { Validator, ValidationResult };
