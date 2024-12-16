import { JSTokenizer, JSTokenType } from '../src/tokenizer/JSTokenizer';

describe('JSTokenizer', () => {
  let tokenizer: JSTokenizer;

  beforeEach(() => {
    tokenizer = new JSTokenizer();
  });

  describe('Basic Token Recognition', () => {
    it('should tokenize a simple const declaration', () => {
      const input = 'const x = 42;';
      const tokens = tokenizer.tokenize(input);

      expect(tokens).toEqual([
        { type: JSTokenType.Keyword, value: 'const' },
        { type: JSTokenType.Identifier, value: 'x' },
        { type: JSTokenType.Operator, value: '=' },
        { type: JSTokenType.Literal, value: '42' },
        { type: JSTokenType.Delimiter, value: ';' },
        { type: JSTokenType.EndOfStatement, value: 'EOF' },
      ]);
    });

    it('should recognize various delimiters', () => {
      const input = '(); {} []';
      const tokens = tokenizer.tokenize(input);
    
      const expectedDelimiters = ['(', ')', '{', '}', '[', ']'];
      const actualDelimiters = tokens.filter(token => token.type === JSTokenType.Delimiter);
    
      expectedDelimiters.forEach((delimiter, index) => {
        expect(actualDelimiters[index]).toEqual({
          type: JSTokenType.Delimiter,
          value: delimiter,
        });
      });
    });
    

    it('should recognize keywords', () => {
      const input = 'const let var if else function return';
      const tokens = tokenizer.tokenize(input);

      const expectedKeywords = ['const', 'let', 'var', 'if', 'else', 'function', 'return'];
      expectedKeywords.forEach((keyword, index) => {
        expect(tokens[index]).toEqual({
          type: JSTokenType.Keyword,
          value: keyword,
        });
      });
    });

    it('should handle operators', () => {
      const input = '= + - * / % === !== < >';
      const tokens = tokenizer.tokenize(input);

      const expectedOperators = ['=', '+', '-', '*', '/', '%', '===', '!==', '<', '>'];
      expectedOperators.forEach((op, index) => {
        expect(tokens[index]).toEqual({
          type: JSTokenType.Operator,
          value: op,
        });
      });
    });
  });

  describe('Complex Token Recognition', () => {
    it('should handle mixed tokens with whitespace', () => {
      const input = 'const  x   =    42 ;';
      const tokens = tokenizer.tokenize(input);

      expect(tokens).toEqual([
        { type: JSTokenType.Keyword, value: 'const' },
        { type: JSTokenType.Identifier, value: 'x' },
        { type: JSTokenType.Operator, value: '=' },
        { type: JSTokenType.Literal, value: '42' },
        { type: JSTokenType.Delimiter, value: ';' },
        { type: JSTokenType.EndOfStatement, value: 'EOF' },
      ]);
    });

    it('should handle identifiers with numbers and special characters', () => {
      const input = 'const $var_123 = 42;';
      const tokens = tokenizer.tokenize(input);

      expect(tokens).toEqual([
        { type: JSTokenType.Keyword, value: 'const' },
        { type: JSTokenType.Identifier, value: '$var_123' },
        { type: JSTokenType.Operator, value: '=' },
        { type: JSTokenType.Literal, value: '42' },
        { type: JSTokenType.Delimiter, value: ';' },
        { type: JSTokenType.EndOfStatement, value: 'EOF' },
      ]);
    });
  });

  describe('Error Handling', () => {
    it('should throw an error for unexpected characters', () => {
      const input = 'const x = @invalid;';
      expect(() => tokenizer.tokenize(input)).toThrow('Unexpected character: @');
    });

    it('should handle empty input', () => {
      const input = '';
      const tokens = tokenizer.tokenize(input);
      expect(tokens).toEqual([{ type: JSTokenType.EndOfStatement, value: 'EOF' }]);
    });
  });
});
