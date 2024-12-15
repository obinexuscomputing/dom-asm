type Token = {
    type: string;
    value: string;
    position: {
        line: number;
        column: number;
    };
};
declare class Tokenizer {
    private input;
    private position;
    private line;
    private column;
    constructor(input: string);
    private isWhitespace;
    private isCommentStart;
    private isDelimiter;
    private consumeWhitespace;
    private consumeComment;
    private consumeDelimiter;
    private consumeOther;
    tokenize(): Token[];
}

type ASTNode = {
    type: string;
    value?: string;
    children: ASTNode[];
};

declare class Validator {
    private ast;
    private errors;
    constructor(ast: ASTNode);
    private validateStylesheet;
    private validateRule;
    private validateDeclaration;
    validate(): string[];
}

declare class ASTOptimizer {
    private ast;
    constructor(ast: ASTNode);
    private removeDuplicateDeclarations;
    private mergeAdjacentRules;
    optimize(): ASTNode;
}

/**
 * import { Tokenizer } from "../tokenizer";
import { ASTBuilder } from "../ast";
import { Optimizer } from "../optimizer";

const cssInput = `/* Example CSS \*\/
body {
    background: white;
    color: black;
    color: black;
  }
  
  const tokenizer = new Tokenizer(cssInput);
  const tokens = tokenizer.tokenize();
  const astBuilder = new ASTBuilder(tokens);
  let ast = astBuilder.buildAST();
  
  const optimizer = new Optimizer(ast);
  ast = optimizer.optimize();
  
  const generator = new CodeGenerator(ast);
  const cssOutput = generator.generate();
  
  console.log(cssOutput);
  **/
declare class CodeGenerator {
    private ast;
    constructor(ast: ASTNode);
    private generateStylesheet;
    private generateRule;
    private generateSelector;
    private generateDeclaration;
    generate(): string;
}

declare class Parser {
    private input;
    private validate;
    constructor(input: string, validate?: boolean);
    parse(): ASTNode;
}

declare global {
    interface Window {
        DOMCSS?: any;
        DOMHTML?: any;
        DOMJS?: any;
    }
    namespace NodeJS {
        interface Global {
            DOMCSS?: any;
            DOMHTML?: any;
            DOMJS?: any;
        }
    }
}

export { type ASTNode, ASTOptimizer, CodeGenerator, Parser, Tokenizer, Validator };
