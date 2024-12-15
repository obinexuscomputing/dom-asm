import fs from "fs";
import { JSTokenizer, JSASTBuilder, JSValidator, JSASTOptimizer, JSCodeGenerator } from "@obinexuscomputing/js";

const content = fs.readFileSync("examples/assets/main.js", "utf-8");

// Tokenize
const tokenizer = new JSTokenizer();
const tokens = tokenizer.tokenize(content);
console.log("JS Tokens:", tokens);

// Parse
const builder = new JSASTBuilder(tokens);
const ast = builder.buildAST();

// Validate
const validator = new JSValidator();
const validationErrors = validator.validate(ast);
if (validationErrors.length > 0) {
  console.error("JS Validation Errors:", validationErrors);
} else {
  console.log("JS Validation Passed");
}

// Optimize
const optimizer = new JSASTOptimizer();
const optimizedAST = optimizer.optimize(ast);
const generator = new JSCodeGenerator();
const optimizedJS = generator.generate(optimizedAST);
console.log("Optimized JavaScript:", optimizedJS);
