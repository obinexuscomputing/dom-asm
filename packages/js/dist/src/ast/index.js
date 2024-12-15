import { TokenType } from "../tokenizer";
export class ASTBuilder {
    build(tokens) {
        const root = { type: 'Program', children: [] };
        let current = 0;
        function walk() {
            const token = tokens[current];
            if (token.type === TokenType.Literal) {
                current++;
                return { type: 'Literal', value: token.value };
            }
            if (token.type === TokenType.Identifier) {
                current++;
                return { type: 'Identifier', value: token.value };
            }
            if (token.type === TokenType.Keyword && token.value === 'const') {
                current++;
                const identifier = walk(); // Identifier
                current++; // Skip '='
                const value = walk(); // Value (expression or literal)
                current++; // Skip ';'
                return {
                    type: 'VariableDeclaration',
                    value: 'const',
                    children: [identifier, value],
                };
            }
            throw new Error(`Unexpected token: ${token.type === TokenType.EndOfStatement ? 'EOF' : token.value}`);
        }
        while (current < tokens.length && tokens[current].type !== TokenType.EndOfStatement) {
            root.children?.push(walk());
        }
        return root;
    }
}
//# sourceMappingURL=index.js.map