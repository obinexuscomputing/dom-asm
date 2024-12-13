import { HTMLTokenizer } from "../tokenizer/index";
import { AST, ASTNode } from "../ast/index";
import { ValidationResult, Validator } from "../validator/index";

class Parser {
  private tokenizer: HTMLTokenizer;
  private astBuilder: AST;
  private validator: Validator;

  constructor() {
    this.tokenizer = new HTMLTokenizer("");
    this.astBuilder = new AST();
    this.validator = new Validator();
  }

  public parse(input: string): { ast: ASTNode; validationResult: ValidationResult } {
    // Step 1: Tokenize the input
    this.tokenizer = new HTMLTokenizer(input);
    const tokens = this.tokenizer.tokenize();

    // Step 2: Build the AST
    const ast = this.astBuilder.buildAST(tokens);

    // Step 3: Validate the AST
    const validationResult = this.validator.validateAST(ast);

    return { ast, validationResult };
  }
}

export { Parser };
