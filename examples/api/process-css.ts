import fs from "fs";
import { CSSTokenizer, CSSParser, CSSValidator, CSSASTOptimizer, CSSCodeGenerator } from "@obinexuscomputing/css";

const content = fs.readFileSync("examples/assets/main.css", "utf-8");

// Tokenize
const tokenizer = new CSSTokenizer(content);
const tokens = tokenizer.tokenize();
console.log("CSS Tokens:", tokens);

// Parse
const parser = new CSSParser(tokens);
const ast = parser.parse();

// Validate
const validator = new CSSValidator(ast);
const validationErrors = validator.validate();
if (validationErrors.length > 0) {
  console.error("CSS Validation Errors:", validationErrors);
} else {
  console.log("CSS Validation Passed");
}

// Optimize
const optimizer = new CSSASTOptimizer(ast);
const optimizedAST = optimizer.optimize();
const generator = new CSSCodeGenerator(optimizedAST);
const optimizedCSS = generator.generate();
console.log("Optimized CSS:", optimizedCSS);
