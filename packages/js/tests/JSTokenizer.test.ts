import { JSTokenizer } from '../src/tokenizer';

describe('Tokenizer', () => {
  let tokenizer: Tokenizer;

  beforeEach(() => {
    tokenizer = new Tokenizer();
  });


  describe('Comments', () => {
    it('should handle multiple single-line comments', () => {
      const input = '// First comment\n// Second comment\nconst x = 42;';
      const tokens = tokenizer.tokenize(input);
      
      expect(tokens).toEqual([
        { type: TokenType.Comment, value: ' First comment' },
        { type: TokenType.Comment, value: ' Second comment' },
        { type: TokenType.Keyword, value: 'const' },
        { type: TokenType.Identifier, value: 'x' },
        { type: TokenType.Operator, value: '=' },
        { type: TokenType.Literal, value: '42' },
        { type: TokenType.Delimiter, value: ';' },
        { type: TokenType.EndOfStatement, value: 'EOF' },
      ]);
    });

    it('should handle comments at the end of the file', () => {
      const input = 'const x = 42;\n// Final comment';
      const tokens = tokenizer.tokenize(input);
      
      expect(tokens).toEqual([
        { type: TokenType.Keyword, value: 'const' },
        { type: TokenType.Identifier, value: 'x' },
        { type: TokenType.Operator, value: '=' },
        { type: TokenType.Literal, value: '42' },
        { type: TokenType.Delimiter, value: ';' },
        { type: TokenType.Comment, value: ' Final comment' },
        { type: TokenType.EndOfStatement, value: 'EOF' },
      ]);
    });

    it('should handle nested multi-line comments', () => {
      const input = '/* outer /* inner */ comment */';
      const tokens = tokenizer.tokenize(input);
      
      expect(tokens).toEqual([
        { type: TokenType.Comment, value: ' outer /* inner */ comment ' },
        { type: TokenType.EndOfStatement, value: 'EOF' },
      ]);
    });
  });

  describe('Template Literals', () => {
    it('should handle nested template literals', () => {
      const input = '`outer ${`inner`}`';
      const tokens = tokenizer.tokenize(input);
      
      expect(tokens).toEqual([
        { type: TokenType.TemplateLiteral, value: 'outer ${`inner`}' },
        { type: TokenType.EndOfStatement, value: 'EOF' },
      ]);
    });

    it('should handle empty template literals', () => {
      const input = '``';
      const tokens = tokenizer.tokenize(input);
      
      expect(tokens).toEqual([
        { type: TokenType.TemplateLiteral, value: '' },
        { type: TokenType.EndOfStatement, value: 'EOF' },
      ]);
    });

    it('should handle template literals with multiple interpolations', () => {
      const input = '`${a} + ${b} = ${sum}`';
      const tokens = tokenizer.tokenize(input);
      
      expect(tokens).toEqual([
        { type: TokenType.TemplateLiteral, value: '${a} + ${b} = ${sum}' },
        { type: TokenType.EndOfStatement, value: 'EOF' },
      ]);
    });
  });

  describe('Literals and Numbers', () => {
    it('should handle decimal numbers', () => {
      const input = 'const x = 3.14159;';
      const tokens = tokenizer.tokenize(input);
      
      expect(tokens).toEqual([
        { type: TokenType.Keyword, value: 'const' },
        { type: TokenType.Identifier, value: 'x' },
        { type: TokenType.Operator, value: '=' },
        { type: TokenType.Literal, value: '3.14159' },
        { type: TokenType.Delimiter, value: ';' },
        { type: TokenType.EndOfStatement, value: 'EOF' },
      ]);
    });

    it('should handle consecutive operators', () => {
      const input = 'x !== y && z === w';
      const tokens = tokenizer.tokenize(input);
      
      expect(tokens).toEqual([
        { type: TokenType.Identifier, value: 'x' },
        { type: TokenType.Operator, value: '!==' },
        { type: TokenType.Identifier, value: 'y' },
        { type: TokenType.Operator, value: '&&' },
        { type: TokenType.Identifier, value: 'z' },
        { type: TokenType.Operator, value: '===' },
        { type: TokenType.Identifier, value: 'w' },
        { type: TokenType.Delimiter, value: ';' },
        { type: TokenType.EndOfStatement, value: 'EOF' },
      ]);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty input', () => {
      const input = '';
      const tokens = tokenizer.tokenize(input);
      
      expect(tokens).toEqual([
        { type: TokenType.EndOfStatement, value: 'EOF' },
      ]);
    });

    it('should handle whitespace-only input', () => {
      const input = '   \n\t   \r\n   ';
      const tokens = tokenizer.tokenize(input);
      
      expect(tokens).toEqual([
        { type: TokenType.EndOfStatement, value: 'EOF' },
      ]);
    });

    it('should handle multiple consecutive delimiters', () => {
      const input = 'if (x) { ; ; ; }';
      const tokens = tokenizer.tokenize(input);
      
      expect(tokens).toEqual([
        { type: TokenType.Keyword, value: 'if' },
        { type: TokenType.Delimiter, value: '(' },
        { type: TokenType.Identifier, value: 'x' },
        { type: TokenType.Delimiter, value: ')' },
        { type: TokenType.Delimiter, value: '{' },
        { type: TokenType.Delimiter, value: ';' },
        { type: TokenType.Delimiter, value: ';' },
        { type: TokenType.Delimiter, value: ';' },
        { type: TokenType.Delimiter, value: '}' },
        { type: TokenType.EndOfStatement, value: 'EOF' },
      ]);
    });
  });

  describe('Error Cases', () => {
    it('should throw error for invalid identifier characters', () => {
      const input = 'const #invalid = 42;';
      expect(() => tokenizer.tokenize(input)).toThrow('Unexpected character: #');
    });

    it('should throw error for unterminated nested template literals', () => {
      const input = '`outer ${`inner`';
      expect(() => tokenizer.tokenize(input)).toThrow('Unterminated template literal');
    });

    it('should throw error for invalid operators', () => {
      const input = 'x ==> y';
      expect(() => tokenizer.tokenize(input)).toThrow('Unexpected character: >');
    });
  });

  describe('Advanced Literals', () => {
    it('should handle scientific notation', () => {
      const input = 'const x = 1.23e-4;';
      const tokens = tokenizer.tokenize(input);
      
      expect(tokens).toEqual([
        { type: TokenType.Keyword, value: 'const' },
        { type: TokenType.Identifier, value: 'x' },
        { type: TokenType.Operator, value: '=' },
        { type: TokenType.Literal, value: '1.23e-4' },
        { type: TokenType.Delimiter, value: ';' },
        { type: TokenType.EndOfStatement, value: 'EOF' },
      ]);
    });

    it('should handle leading decimal point', () => {
      const input = 'const x = .123;';
      const tokens = tokenizer.tokenize(input);
      
      expect(tokens).toEqual([
        { type: TokenType.Keyword, value: 'const' },
        { type: TokenType.Identifier, value: 'x' },
        { type: TokenType.Operator, value: '=' },
        { type: TokenType.Literal, value: '.123' },
        { type: TokenType.Delimiter, value: ';' },
        { type: TokenType.EndOfStatement, value: 'EOF' },
      ]);
    });
  });

  describe('Complex Template Literals', () => {
    it('should handle escaped backticks', () => {
      const input = '`Hello \\` World`';
      const tokens = tokenizer.tokenize(input);
      
      expect(tokens).toEqual([
        { type: TokenType.TemplateLiteral, value: 'Hello \\` World' },
        { type: TokenType.EndOfStatement, value: 'EOF' },
      ]);
    });

    it('should handle escaped dollar signs', () => {
      const input = '`\\${not an interpolation}`';
      const tokens = tokenizer.tokenize(input);
      
      expect(tokens).toEqual([
        { type: TokenType.TemplateLiteral, value: '\\${not an interpolation}' },
        { type: TokenType.EndOfStatement, value: 'EOF' },
      ]);
    });

    it('should handle deeply nested template literals', () => {
      const input = '`outer ${`middle ${`inner`}`}`';
      const tokens = tokenizer.tokenize(input);
      
      expect(tokens).toEqual([
        { type: TokenType.TemplateLiteral, value: 'outer ${`middle ${`inner`}`}' },
        { type: TokenType.EndOfStatement, value: 'EOF' },
      ]);
    });
  });

  describe('Complex Comments', () => {
    it('should handle multiple nested multi-line comments', () => {
      const input = '/* level1 /* level2 /* level3 */ still2 */ still1 */';
      const tokens = tokenizer.tokenize(input);
      
      expect(tokens).toEqual([
        { type: TokenType.Comment, value: ' level1 /* level2 /* level3 */ still2 */ still1 ' },
        { type: TokenType.EndOfStatement, value: 'EOF' },
      ]);
    });

    it('should handle comments with escaped characters', () => {
      const input = '// Comment with \\"quotes\\" and \\n newline';
      const tokens = tokenizer.tokenize(input);
      
      expect(tokens).toEqual([
        { type: TokenType.Comment, value: ' Comment with \\"quotes\\" and \\n newline' },
        { type: TokenType.EndOfStatement, value: 'EOF' },
      ]);
    });
  });

  describe('Complex Operators', () => {
    it('should handle compound assignment operators', () => {
      const input = 'x += 1; y *= 2; z ||= true;';
      const tokens = tokenizer.tokenize(input);
      
      expect(tokens).toEqual([
        { type: TokenType.Identifier, value: 'x' },
        { type: TokenType.Operator, value: '+=' },
        { type: TokenType.Literal, value: '1' },
        { type: TokenType.Delimiter, value: ';' },
        { type: TokenType.Identifier, value: 'y' },
        { type: TokenType.Operator, value: '*=' },
        { type: TokenType.Literal, value: '2' },
        { type: TokenType.Delimiter, value: ';' },
        { type: TokenType.Identifier, value: 'z' },
        { type: TokenType.Operator, value: '||=' },
        { type: TokenType.Identifier, value: 'true' },
        { type: TokenType.Delimiter, value: ';' },
        { type: TokenType.EndOfStatement, value: 'EOF' },
      ]);
    });

    it('should handle nullish coalescing and optional chaining', () => {
      const input = 'a ?? b?.c';
      const tokens = tokenizer.tokenize(input);
      
      expect(tokens).toEqual([
        { type: TokenType.Identifier, value: 'a' },
        { type: TokenType.Operator, value: '??' },
        { type: TokenType.Identifier, value: 'b' },
        { type: TokenType.Operator, value: '?.' },
        { type: TokenType.Identifier, value: 'c' },
        { type: TokenType.Delimiter, value: ';' },
        { type: TokenType.EndOfStatement, value: 'EOF' },
      ]);
    });
  });

  describe('Edge Cases', () => {
    it('should handle mixed whitespace and comments', () => {
      const input = '  /* comment */  \n\t// line comment\r\n  ';
      const tokens = tokenizer.tokenize(input);
      
      expect(tokens).toEqual([
        { type: TokenType.Comment, value: ' comment ' },
        { type: TokenType.Comment, value: ' line comment' },
        { type: TokenType.EndOfStatement, value: 'EOF' },
      ]);
    });

    it('should handle empty statements', () => {
      const input = ';;;;';
      const tokens = tokenizer.tokenize(input);
      
      expect(tokens).toEqual([
        { type: TokenType.Delimiter, value: ';' },
        { type: TokenType.Delimiter, value: ';' },
        { type: TokenType.Delimiter, value: ';' },
        { type: TokenType.Delimiter, value: ';' },
        { type: TokenType.EndOfStatement, value: 'EOF' },
      ]);
    });
  });

  describe('Additional Error Cases', () => {
    it('should throw error for invalid number format', () => {
      const input = '123.456.789';
      expect(() => tokenizer.tokenize(input)).toThrow('Invalid number format');
    });

    it('should throw error for unterminated nested comments', () => {
      const input = '/* outer /* inner */';
      expect(() => tokenizer.tokenize(input)).toThrow('Unexpected character: EOF');
    });

    it('should throw error for invalid escape sequences in template literals', () => {
      const input = '`invalid escape \\z`';
      expect(() => tokenizer.tokenize(input)).toThrow('Invalid escape sequence');
    });

    it('should handle large inputs efficiently', () => {
      const input = 'const x = 42;'.repeat(500);
      const tokens = tokenizer.tokenize(input);
      expect(tokens.length).toBeGreaterThan(0); // Verify output exists
    });
    it('should handle line continuation with backslashes', () => {
      const input = 'const x = 42 \\\n + 1;';
      const tokens = tokenizer.tokenize(input);
      expect(tokens).toEqual([
        { type: TokenType.Keyword, value: 'const' },
        { type: TokenType.Identifier, value: 'x' },
        { type: TokenType.Operator, value: '=' },
        { type: TokenType.Literal, value: '42' },
        { type: TokenType.Operator, value: '+' },
        { type: TokenType.Literal, value: '1' },
        { type: TokenType.Delimiter, value: ';' },
        { type: TokenType.EndOfStatement, value: 'EOF' },
      ]);
    });
    
  });
});