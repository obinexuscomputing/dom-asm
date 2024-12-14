import { Tokenizer, TokenType } from '../src/tokenizer';

describe('Tokenizer', () => {
  let tokenizer: Tokenizer;

  beforeEach(() => {
    tokenizer = new Tokenizer();
  });

  it('should tokenize variable declarations correctly', () => {
    const input = 'const x = 42;';
    const tokens = tokenizer.tokenize(input);

    expect(tokens).toEqual([
      { type: TokenType.Keyword, value: 'const' },
      { type: TokenType.Identifier, value: 'x' },
      { type: TokenType.Operator, value: '=' },
      { type: TokenType.Literal, value: '42' },
      { type: TokenType.Delimiter, value: ';' },
      { type: TokenType.EndOfStatement, value: 'EOF' }, // Include EOF token
    ]);
  });
});
