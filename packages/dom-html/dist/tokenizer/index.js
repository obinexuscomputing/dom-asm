// Example usage:
//   const cssInput = `/* Example CSS */
//   body {
//     background: white;
//   }`;
//   const tokenizer = new Tokenizer(cssInput);
//   console.log(tokenizer.tokenize());
export class Tokenizer {
    input;
    position;
    line;
    column;
    constructor(input) {
        this.input = input;
        this.position = 0;
        this.line = 1;
        this.column = 1;
    }
    isWhitespace(char) {
        return char === ' ' || char === '\t' || char === '\n' || char === '\r';
    }
    isCommentStart() {
        return this.input[this.position] === '/' && this.input[this.position + 1] === '*';
    }
    consumeWhitespace() {
        const start = this.position;
        while (this.isWhitespace(this.input[this.position])) {
            if (this.input[this.position] === '\n') {
                this.line++;
                this.column = 1;
            }
            else {
                this.column++;
            }
            this.position++;
        }
        return {
            type: 'whitespace',
            value: this.input.slice(start, this.position),
            position: { line: this.line, column: this.column },
        };
    }
    consumeComment() {
        const start = this.position;
        this.position += 2; // Skip '/*'
        while (this.position < this.input.length && !(this.input[this.position] === '*' && this.input[this.position + 1] === '/')) {
            if (this.input[this.position] === '\n') {
                this.line++;
                this.column = 1;
            }
            else {
                this.column++;
            }
            this.position++;
        }
        this.position += 2; // Skip '*/'
        return {
            type: 'comment',
            value: this.input.slice(start, this.position),
            position: { line: this.line, column: this.column },
        };
    }
    consumeOther() {
        const start = this.position;
        while (this.position < this.input.length && !this.isWhitespace(this.input[this.position]) && !this.isCommentStart()) {
            this.position++;
            this.column++;
        }
        return {
            type: 'other',
            value: this.input.slice(start, this.position),
            position: { line: this.line, column: this.column },
        };
    }
    tokenize() {
        const tokens = [];
        while (this.position < this.input.length) {
            const char = this.input[this.position];
            if (this.isWhitespace(char)) {
                tokens.push(this.consumeWhitespace());
            }
            else if (this.isCommentStart()) {
                tokens.push(this.consumeComment());
            }
            else {
                tokens.push(this.consumeOther());
            }
        }
        return tokens;
    }
}
//  
