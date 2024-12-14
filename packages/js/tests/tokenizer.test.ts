import { Tokenizer, TokenType } from '../src/tokenizer';

describe('Tokenizer', () => {
  let tokenizer: Tokenizer;

  beforeEach(() => {
    tokenizer = new Tokenizer();
  });

  // Existing tests...

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
});