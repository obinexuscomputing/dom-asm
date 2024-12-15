// Import the Token type from the tokenizer module
import { TokenType } from "../tokenizer";
export class JSASTBuilder {
    tokens;
    position;
    constructor(tokens) {
        this.tokens = tokens;
        this.position = 0;
    }
    currentToken() {
        return this.position < this.tokens.length ? this.tokens[this.position] : null;
    }
    consumeToken() {
        const token = this.currentToken();
        if (token)
            this.position++;
        return token;
    }
    parseProgram() {
        const program = { type: "Program", children: [] };
        while (this.currentToken()) {
            const statement = this.parseStatement();
            if (statement) {
                program.children.push(statement);
            }
        }
        return program;
    }
    parseStatement() {
        const token = this.currentToken();
        if (token?.type === TokenType.Keyword && token.value === "const") {
            return this.parseVariableDeclaration();
        }
        if (token?.type === TokenType.Literal) {
            return this.parseInlineConstant();
        }
        return null;
    }
    parseVariableDeclaration() {
        this.consumeToken(); // Consume 'const'
        const identifier = this.currentToken();
        if (!identifier || identifier.type !== TokenType.Identifier) {
            throw new Error("Expected identifier after 'const'");
        }
        this.consumeToken();
        const equals = this.currentToken();
        if (!equals || equals.value !== "=") {
            throw new Error("Expected '=' after identifier");
        }
        this.consumeToken();
        const value = this.parseValue();
        if (!value) {
            throw new Error("Expected value after '='");
        }
        return {
            type: "VariableDeclaration",
            children: [
                { type: "Identifier", value: identifier.value, children: [] },
                value,
            ],
        };
    }
    parseInlineConstant() {
        const token = this.consumeToken();
        return { type: "InlineConstant", value: token.value, children: [] };
    }
    parseValue() {
        const token = this.currentToken();
        if (token?.type === TokenType.Literal) {
            return this.parseInlineConstant();
        }
        return null;
    }
    buildAST() {
        return this.parseProgram();
    }
}
//# sourceMappingURL=index.js.map