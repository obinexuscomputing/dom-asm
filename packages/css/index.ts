
// Re-export modules for public API
export { Tokenizer } from "./tokenizer";
export { ASTBuilder, ASTNode } from "./ast";
export { Validator } from "./validator";
export { Optimizer } from "./optimizer";
export { CodeGenerator } from "./generator";
export { Parser } from "./parser";

// UMD module initialization (if required for global use)
if (typeof window !== "undefined") {
  (window as any).DOMCSS = {
    Tokenizer: Tokenizer,
    ASTBuilder: ASTBuilder,
    Validator: Validator,
    Optimizer: Optimizer,
    CodeGenerator: CodeGenerator,
    Parser: Parser,
  };
}

// Example of usage in UMD
/**
<script src="path-to-dom-css.umd.js"></script>
<script>
  const tokenizer = new DOMCSS.Tokenizer("body { color: red; }");
  const tokens = tokenizer.tokenize();
  const astBuilder = new DOMCSS.ASTBuilder(tokens);
  const ast = astBuilder.buildAST();
  console.log(ast);
</script>
**/
