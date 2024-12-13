import { ASTNode } from "../ast/index";
import { ValidationResult } from "../validator/index";
/**
 * import { Parser } from "./parser/index";

const htmlInput = `
<html:html>
  <html:head>
    <html:title>Sample HTML6 Document</html:title>
  </html:head>
  <html:body>
    <custom:widget id="main-widget" type="interactive"></custom:widget>
  </html:body>
</html:html>
`;

const parser = new Parser();
const { ast, validationResult } = parser.parse(htmlInput);

if (validationResult.valid) {
  console.log("Valid HTML6 Document.");
} else {
  console.error("Validation Errors:");
  validationResult.errors.forEach((error) => console.error(error));
}

// Optionally, visualize the AST
const astBuilder = new AST();
astBuilder.printAST(ast);

 */
declare class Parser {
    private tokenizer;
    private astBuilder;
    private validator;
    constructor();
    parse(input: string): {
        ast: ASTNode;
        validationResult: ValidationResult;
    };
}
export { Parser };
