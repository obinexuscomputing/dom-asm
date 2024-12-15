import fs from "fs";
import { HTMLTokenizer, HTMLParser, HTMLValidator, HTMLASTOptimizer, HTMLCodeGenerator } from "@obinexuscomputing/html";

const content = fs.readFileSync("examples/assets/index.html", "utf-8");

// Tokenize
const tokenizer = new HTMLTokenizer(content);
const tokens = tokenizer.tokenize();
console.log("HTML Tokens:", tokens);

// Parse
const parser = new HTMLParser();
const ast = parser.parse(tokens);

// Validate
const validator = new HTMLValidator();
const validationResult = validator.validate(ast);
if (!validationResult.valid) {
  console.error("HTML Validation Errors:", validationResult.errors);
} else {
  console.log("HTML Validation Passed");
}

// Optimize
const optimizer = new HTMLASTOptimizer();
const optimizedAST = optimizer.optimize({ root: ast });
const generator = new HTMLCodeGenerator();
const optimizedHTML = generator.generateHTML(optimizedAST.root);
console.log("Optimized HTML:", optimizedHTML);
