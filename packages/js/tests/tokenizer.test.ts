import { Tokenizer, TokenType } from '../src/tokenizer';

describe('Tokenizer', () => {
  const tokenizer = new Tokenizer();

  it('should tokenize a variable declaration', () => {
    const code = 'const x = 42;';
    const tokens = tokenizer.tokenize(code);

    expect(tokens).toEqual([
      { type: TokenType.Keyword, value: 'const' },
      { type: TokenType.Identifier, value: 'x' },
      { type: TokenType.Operator, value: '=' },
      { type: TokenType.Literal, value: '42' },
      { type: TokenType.Delimiter, value: ';' },
      { type: TokenType.EndOfStatement, value: 'EOF' },
    ]);
  });

  it('should throw an error for unexpected characters', () => {
    expect(() => tokenizer.tokenize('@invalid')).toThrow('Unexpected character: @');
  });
});
