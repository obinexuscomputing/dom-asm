export var TokenType;
(function (TokenType) {
    TokenType[TokenType["Keyword"] = 0] = "Keyword";
    TokenType[TokenType["Identifier"] = 1] = "Identifier";
    TokenType[TokenType["Operator"] = 2] = "Operator";
    TokenType[TokenType["Delimiter"] = 3] = "Delimiter";
    TokenType[TokenType["Literal"] = 4] = "Literal";
    TokenType[TokenType["TemplateLiteral"] = 5] = "TemplateLiteral";
    TokenType[TokenType["Comment"] = 6] = "Comment";
    TokenType[TokenType["EndOfStatement"] = 7] = "EndOfStatement";
    TokenType[TokenType["Number"] = 8] = "Number";
    TokenType[TokenType["String"] = 9] = "String";
})(TokenType || (TokenType = {}));
export class Tokenizer {
    keywords = new Set(['const', 'let', 'var', 'if', 'else', 'function', 'return', 'for', 'while', 'true', 'false']);
    operators = new Set(['=', '+', '-', '*', '/', '%', '===', '!==', '<', '>', '&&', '||', '!', '==', '=>', '+=', '-=', '*=', '/=', '||=', '&&=', '??', '?.']);
    delimiters = new Set([';', '{', '}', '(', ')', '[', ']']);
    singleCharDelimiters = new Set([';', '{', '}', '(', ')', '[', ']']);
    previousToken = null;
    isNumericStart(char) {
        return /[0-9]/.test(char);
    }
    isValidNumber(value) {
        const decimalPoints = (value.match(/\./g) || []).length;
        if (decimalPoints > 1)
            return false;
        if (/[eE]/.test(value)) {
            const parts = value.split(/[eE]/);
            if (parts.length !== 2)
                return false;
            const [base, exponent] = parts;
            if (!this.isValidNumber(base))
                return false;
            const cleanExponent = exponent.replace(/^[+-]/, '');
            if (!/^\d+$/.test(cleanExponent))
                return false;
        }
        return true;
    }
    readNumber(input, start) {
        let current = start;
        let number = '';
        let hasDot = false;
        let hasExponent = false;
        // Handle leading decimal point
        if (input[current] === '.') {
            if (!/[0-9]/.test(input[current + 1])) {
                throw new Error(`Unexpected character: ${input[current]}`);
            }
            number = '.';
            current++;
        }
        while (current < input.length) {
            const char = input[current];
            const nextChar = input[current + 1];
            if (/[0-9]/.test(char)) {
                number += char;
            }
            else if (char === '.' && !hasDot && !hasExponent) {
                hasDot = true;
                number += char;
            }
            else if ((char === 'e' || char === 'E') && !hasExponent) {
                hasExponent = true;
                number += char;
                if (nextChar === '+' || nextChar === '-') {
                    number += nextChar;
                    current++;
                }
            }
            else if (char === '.' && hasDot) {
                throw new Error('Invalid number format');
            }
            else {
                break;
            }
            current++;
        }
        if (!this.isValidNumber(number)) {
            throw new Error('Invalid number format');
        }
        return [number, current];
    }
    readMultilineComment(input, start) {
        let current = start + 2; // Skip /*
        let value = '';
        let depth = 1;
        while (current < input.length && depth > 0) {
            if (input[current] === '/' && input[current + 1] === '*') {
                depth++;
                value += '/*';
                current += 2;
            }
            else if (input[current] === '*' && input[current + 1] === '/') {
                depth--;
                if (depth > 0) {
                    value += '*/';
                }
                current += 2;
            }
            else {
                value += input[current++];
            }
        }
        if (depth > 0) {
            throw new Error('Unexpected character: EOF');
        }
        return [value, current];
    }
    readTemplateLiteral(input, start) {
        let current = start + 1; // Skip opening backtick
        let value = '';
        while (current < input.length && input[current] !== '`') {
            if (input[current] === '\\') {
                const nextChar = input[current + 1];
                if (!['`', '$', '\\'].includes(nextChar)) {
                    throw new Error('Invalid escape sequence');
                }
                value += '\\' + nextChar;
                current += 2;
            }
            else if (input[current] === '$' && input[current + 1] === '{') {
                let braceCount = 1;
                const expressionStart = current;
                current += 2;
                while (current < input.length && braceCount > 0) {
                    if (input[current] === '{')
                        braceCount++;
                    if (input[current] === '}')
                        braceCount--;
                    current++;
                }
                value += input.slice(expressionStart, current);
            }
            else {
                value += input[current++];
            }
        }
        if (current >= input.length) {
            throw new Error('Unterminated template literal');
        }
        return [value, current + 1]; // Skip closing backtick
    }
    readOperator(input, start) {
        let operator = '';
        let maxOperator = '';
        let current = start;
        while (current < input.length && /[=!<>&|+\-*/%?.]/.test(input[current])) {
            operator += input[current];
            if (this.operators.has(operator)) {
                maxOperator = operator;
            }
            current++;
        }
        if (operator.includes('=>') && !this.operators.has(operator)) {
            throw new Error('Unexpected character: >');
        }
        return [maxOperator, maxOperator.length];
    }
    readIdentifier(input, start) {
        let current = start;
        while (current < input.length && /[a-zA-Z0-9_$]/.test(input[current])) {
            current++;
        }
        return [input.slice(start, current), current];
    }
    shouldAddSemicolon(tokens) {
        if (!this.previousToken) {
            return false; // No semicolon needed if there's no previous token
        }
        return (this.previousToken.type !== TokenType.Delimiter &&
            this.previousToken.type !== TokenType.Comment &&
            this.previousToken.type !== TokenType.TemplateLiteral &&
            !tokens.some(token => token.type === TokenType.Delimiter &&
                token.value === ';' &&
                tokens.indexOf(token) === tokens.length - 1));
    }
    tokenize(input) {
        const tokens = [];
        let current = 0;
        const addToken = (type, value) => {
            this.previousToken = { type, value };
            tokens.push(this.previousToken);
        };
        while (current < input.length) {
            let char = input[current];
            // Handle line continuation with backslashes
            if (char === '\\' && input[current + 1] === '\n') {
                current += 2;
                continue;
            }
            // Handle whitespace and ASI
            if (/\s/.test(char)) {
                if (char === '\n' && this.shouldAddSemicolon(tokens)) {
                    addToken(TokenType.Delimiter, ';');
                }
                current++;
                continue;
            }
            // Handle single-line comments
            if (char === '/' && input[current + 1] === '/') {
                let value = '';
                current += 2;
                while (current < input.length && input[current] !== '\n') {
                    value += input[current++];
                }
                if (value.endsWith('\r')) {
                    value = value.slice(0, -1);
                }
                addToken(TokenType.Comment, value);
                continue;
            }
            // Handle multi-line comments
            if (char === '/' && input[current + 1] === '*') {
                const [value, newCurrent] = this.readMultilineComment(input, current);
                current = newCurrent;
                addToken(TokenType.Comment, value);
                continue;
            }
            // Handle template literals
            if (char === '`') {
                const [value, newCurrent] = this.readTemplateLiteral(input, current);
                current = newCurrent;
                addToken(TokenType.TemplateLiteral, value);
                continue;
            }
            // Handle numbers
            if (this.isNumericStart(char) || (char === '.' && this.isNumericStart(input[current + 1]))) {
                const [number, newCurrent] = this.readNumber(input, current);
                current = newCurrent;
                addToken(TokenType.Literal, number);
                continue;
            }
            // Handle delimiters
            if (this.singleCharDelimiters.has(char)) {
                addToken(TokenType.Delimiter, char);
                current++;
                continue;
            }
            // Handle operators
            const [operator, operatorLength] = this.readOperator(input, current);
            if (operator) {
                current += operatorLength;
                addToken(TokenType.Operator, operator);
                continue;
            }
            // Handle identifiers and keywords
            if (/[a-zA-Z_$]/.test(char)) {
                const [value, newCurrent] = this.readIdentifier(input, current);
                current = newCurrent;
                // Change this part - treat 'true' and 'false' as identifiers after operators like ||=
                if (this.previousToken && this.previousToken.type === TokenType.Operator) {
                    addToken(TokenType.Identifier, value);
                }
                else if (this.keywords.has(value)) {
                    addToken(TokenType.Keyword, value);
                }
                else {
                    addToken(TokenType.Identifier, value);
                }
                continue;
            }
            // If we get here, we encountered an unrecognized character
            throw new Error(`Unexpected character: ${char}`);
        }
        if (this.shouldAddSemicolon(tokens)) {
            addToken(TokenType.Delimiter, ';');
        }
        addToken(TokenType.EndOfStatement, 'EOF');
        return tokens;
    }
}
//# sourceMappingURL=index.js.map