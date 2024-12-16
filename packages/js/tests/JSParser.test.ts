import { Token } from "typescript";
import { JSParser, TypedJSASTNode } from "../src";
import { JSTokenizer } from "../src/tokenizer/JSTokenizer";

describe("JSParser", () => {
    let parser: JSParser;
    let tokenizer: JSTokenizer;

    beforeEach(() => {
        tokenizer = new Tokenizer();
        parser = new JSParser();
    });

    test("parses simple expressions", () => {
        const code = "let x = 10;";
        const tokens: Token[] = tokenizer.tokenize(code);
        const ast: TypedJSASTNode = parser.parse();

        expect(ast).toBeDefined();
        expect(ast.body?.length).toBe(1);
    });

    test("handles missing semicolon gracefully", () => {
        const code = "let x = 10"; // Missing semicolon
        const tokens: Token[] = tokenizer.tokenize(code);
        const ast: TypedJSASTNode = parser.parse();

        expect(ast).toBeDefined();
        expect(ast.body?.length).toBe(1);
    });

    test("throws error for invalid syntax", () => {
        const code = "let = 10;"; // Invalid syntax
        const tokens: Token[] = tokenizer.tokenize(code);

        expect(() => parser.parse()).toThrow("Unexpected token '='");
    });

    test("parses nested blocks", () => {
        const code = "if (true) { let y = 20; }";
        const tokens: Token[] = tokenizer.tokenize(code);
        const ast: TypedJSASTNode = parser.parse();

        expect(ast).toBeDefined();
        expect(ast.body?.length).toBe(1);
        expect(ast.body?.[0]?.type).toBe("IfStatement");
    });

    test("handles function declarations", () => {
        const code = "function add(a, b) { return a + b; }";
        const tokens: Token[] = tokenizer.tokenize(code);
        const ast: TypedJSASTNode = parser.parse();

        expect(ast).toBeDefined();
        expect(ast.body?.length).toBe(1);
        expect(ast.body?.[0]?.type).toBe("FunctionDeclaration");
    });

    test("recovers from syntax errors", () => {
        const code = "if (true { let z = 30; }"; // Missing closing parenthesis
        const tokens: Token[] = tokenizer.tokenize(code);

        expect(() => parser.parse()).toThrow("Expected ')' after condition");
    });
});
