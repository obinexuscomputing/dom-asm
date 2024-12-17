export class XMLBaseTokenizer {
    constructor(input) {
        this.input = input;
        this.position = 0;
        this.line = 1;
        this.column = 1;
    }
    peek(offset = 0) {
        return this.input[this.position + offset] || '';
    }
    peekSequence(length) {
        return this.input.slice(this.position, this.position + length);
    }
    matches(str) {
        return this.input.startsWith(str, this.position);
    }
    consume() {
        const char = this.peek();
        if (char === '\n') {
            this.line++;
            this.column = 1; // Reset column on a new line
        }
        else {
            this.column++;
        }
        this.position++;
        return char;
    }
    consumeSequence(length) {
        let result = '';
        for (let i = 0; i < length; i++) {
            result += this.consume();
        }
        return result;
    }
    readUntil(stop, options = {}) {
        const { escape = false, includeStop = false, skipStop = true } = options;
        let result = '';
        let escaped = false;
        while (this.position < this.input.length) {
            const current = this.peek();
            // Handle escape sequences if `escape` is enabled
            if (escape && current === '\\' && !escaped) {
                escaped = true;
                result += this.consume();
                continue;
            }
            const matches = typeof stop === 'string' ? this.matches(stop) : stop.test(current);
            // Check for the stop condition
            if (!escaped && matches) {
                if (includeStop) {
                    if (typeof stop === 'string') {
                        result += this.consumeSequence(stop.length); // Consume the stop string
                    }
                    else {
                        result += this.consume(); // Consume the matching character
                    }
                }
                else if (skipStop) {
                    this.position += typeof stop === 'string' ? stop.length : 1; // Skip the stop character(s)
                }
                break; // Exit the loop once the stop condition is met
            }
            // Append the current character to the result
            result += this.consume();
            escaped = false; // Reset escape flag after consuming a character
        }
        return result;
    }
    readWhile(predicate) {
        let result = '';
        let index = 0;
        while (this.position < this.input.length && predicate(this.peek(), index)) {
            result += this.consume();
            index++;
        }
        return result;
    }
    skipWhitespace() {
        this.readWhile(char => /\s/.test(char));
    }
    getCurrentLocation() {
        return { line: this.line, column: this.column };
    }
    isNameChar(char) {
        return /[a-zA-Z0-9_\-:]/.test(char);
    }
    isIdentifierStart(char) {
        return /[a-zA-Z_]/.test(char);
    }
    isIdentifierPart(char) {
        return /[a-zA-Z0-9_\-]/.test(char);
    }
    readIdentifier() {
        if (!this.isIdentifierStart(this.peek())) {
            return '';
        }
        return this.readWhile((char, index) => index === 0 ? this.isIdentifierStart(char) : this.isIdentifierPart(char));
    }
    readQuotedString() {
        const quote = this.peek();
        if (quote !== '"' && quote !== "'") {
            return '';
        }
        this.consume(); // Skip opening quote
        const value = this.readUntil(quote, { escape: true });
        this.consume(); // Skip closing quote
        return value;
    }
    hasMore() {
        return this.position < this.input.length;
    }
    addError(message) {
        const location = this.getCurrentLocation();
        console.error(`Error at line ${location.line}, column ${location.column}: ${message}`);
    }
    saveState() {
        return {
            position: this.position,
            line: this.line,
            column: this.column
        };
    }
    restoreState(state) {
        this.position = state.position;
        this.line = state.line;
        this.column = state.column;
    }
}
//# sourceMappingURL=XMLBaseTokenizer.js.map