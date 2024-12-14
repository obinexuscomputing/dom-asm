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

  it('should tokenize multiple variable declarations without semicolons', () => {
    const input = `const x = 42
  const y = 24`;
    const tokens = tokenizer.tokenize(input);
  
    expect(tokens).toEqual([
      { type: TokenType.Keyword, value: 'const' },
      { type: TokenType.Identifier, value: 'x' },
      { type: TokenType.Operator, value: '=' },
      { type: TokenType.Literal, value: '42' },
      { type: TokenType.Delimiter, value: ';' }, // Automatically inserted
      { type: TokenType.Keyword, value: 'const' },
      { type: TokenType.Identifier, value: 'y' },
      { type: TokenType.Operator, value: '=' },
      { type: TokenType.Literal, value: '24' },
      { type: TokenType.Delimiter, value: ';' }, // Automatically inserted
      { type: TokenType.EndOfStatement, value: 'EOF' },
    ]);
  });
  

  it('should tokenize single-line comments', () => {
    const input = '// This is a comment\nconst x = 42;';
    const tokens = tokenizer.tokenize(input);

    expect(tokens).toEqual([
      { type: TokenType.Comment, value: ' This is a comment' },
      { type: TokenType.Keyword, value: 'const' },
      { type: TokenType.Identifier, value: 'x' },
      { type: TokenType.Operator, value: '=' },
      { type: TokenType.Literal, value: '42' },
      { type: TokenType.Delimiter, value: ';' },
      { type: TokenType.EndOfStatement, value: 'EOF' },
    ]);
  });

  it('should tokenize multi-line comments', () => {
    const input = `/* Multi-line
comment */ const x = 42;`;
    const tokens = tokenizer.tokenize(input);

    expect(tokens).toEqual([
      { type: TokenType.Comment, value: ' Multi-line\ncomment ' },
      { type: TokenType.Keyword, value: 'const' },
      { type: TokenType.Identifier, value: 'x' },
      { type: TokenType.Operator, value: '=' },
      { type: TokenType.Literal, value: '42' },
      { type: TokenType.Delimiter, value: ';' },
      { type: TokenType.EndOfStatement, value: 'EOF' },
    ]);
  });

  it('should tokenize template literals with interpolation', () => {
    const input = '`Hello, ${name}!`';
    const tokens = tokenizer.tokenize(input);

    expect(tokens).toEqual([
      { type: TokenType.TemplateLiteral, value: 'Hello, ${name}!' },
      { type: TokenType.EndOfStatement, value: 'EOF' },
    ]);
  });

  it('should tokenize expressions with operators', () => {
    const input = 'x = 42 + 24;';
    const tokens = tokenizer.tokenize(input);

    expect(tokens).toEqual([
      { type: TokenType.Identifier, value: 'x' },
      { type: TokenType.Operator, value: '=' },
      { type: TokenType.Literal, value: '42' },
      { type: TokenType.Operator, value: '+' },
      { type: TokenType.Literal, value: '24' },
      { type: TokenType.Delimiter, value: ';' },
      { type: TokenType.EndOfStatement, value: 'EOF' },
    ]);
  });

  it('should throw an error for invalid characters', () => {
    const input = 'const x = @;';
    expect(() => tokenizer.tokenize(input)).toThrow('Unexpected character: @');
  });

  it('should tokenize nested structures correctly', () => {
    const input = 'if (x > 10) { const y = x + 1; }';
    const tokens = tokenizer.tokenize(input);

    expect(tokens).toEqual([
      { type: TokenType.Keyword, value: 'if' },
      { type: TokenType.Delimiter, value: '(' },
      { type: TokenType.Identifier, value: 'x' },
      { type: TokenType.Operator, value: '>' },
      { type: TokenType.Literal, value: '10' },
      { type: TokenType.Delimiter, value: ')' },
      { type: TokenType.Delimiter, value: '{' },
      { type: TokenType.Keyword, value: 'const' },
      { type: TokenType.Identifier, value: 'y' },
      { type: TokenType.Operator, value: '=' },
      { type: TokenType.Identifier, value: 'x' },
      { type: TokenType.Operator, value: '+' },
      { type: TokenType.Literal, value: '1' },
      { type: TokenType.Delimiter, value: ';' },
      { type: TokenType.Delimiter, value: '}' },
      { type: TokenType.EndOfStatement, value: 'EOF' },
    ]);
  });
});
