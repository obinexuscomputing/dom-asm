import { HTMLTokenizer } from '../src/tokenizer/HTMLTokenizer';

describe('HTMLTokenizer', () => {
  test('should compute correct node counts', () => {
    const input = '<div>Hello <!-- Comment --> World</div>';
    const tokenizer = new HTMLTokenizer(input);
    const { tokens } = tokenizer.tokenize();

    const elementCount = tokens.filter(t => t.type === 'StartTag' || t.type === 'EndTag').length / 2;
    const textCount = tokens.filter(t => t.type === 'Text').length;
    const commentCount = tokens.filter(t => t.type === 'Comment').length;

    expect(elementCount).toBe(1);
    expect(textCount).toBe(2);
    expect(commentCount).toBe(1);
  });

  test('should handle comments', () => {
    const input = '<!-- Test Comment -->';
    const tokenizer = new HTMLTokenizer(input);
    const { tokens } = tokenizer.tokenize();

    expect(tokens).toHaveLength(2); // Comment + EOF
    expect(tokens[0]).toMatchObject({
      type: 'Comment',
      data: 'Test Comment',
    });
  });

  test('should handle conditional comments', () => {
    const input = '<!--[if IE]>Test<![endif]-->';
    const tokenizer = new HTMLTokenizer(input);
    const { tokens } = tokenizer.tokenize();

    expect(tokens).toHaveLength(2); // ConditionalComment + EOF
    expect(tokens[0]).toMatchObject({
      type: 'ConditionalComment',
      content: '[if IE]>Test<![endif]',
    });
  });

  test('should handle doctype', () => {
    const input = '<!DOCTYPE html>';
    const tokenizer = new HTMLTokenizer(input);
    const { tokens } = tokenizer.tokenize();

    expect(tokens).toHaveLength(2); // Doctype + EOF
    expect(tokens[0]).toMatchObject({
      type: 'Doctype',
      name: 'html',
    });
  });

  test('should handle CDATA sections', () => {
    const input = '<![CDATA[Test Data]]>';
    const tokenizer = new HTMLTokenizer(input);
    const { tokens } = tokenizer.tokenize();

    expect(tokens).toHaveLength(2); // CDATA + EOF
    expect(tokens[0]).toMatchObject({
      type: 'CDATA',
      content: 'Test Data',
    });
  });

  test('should identify whitespace nodes', () => {
    const input = ' \n \t ';
    const tokenizer = new HTMLTokenizer(input);
    const { tokens } = tokenizer.tokenize();

    expect(tokens).toHaveLength(2); // Text + EOF
    expect(tokens[0]).toMatchObject({
      type: 'Text',
      isWhitespace: true,
    });
  });

  test('should handle unclosed tags', () => {
    const input = '<div';
    const tokenizer = new HTMLTokenizer(input);
    const { tokens, errors } = tokenizer.tokenize();

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toBe('Malformed start tag');
    expect(tokens).toHaveLength(2); // StartTag + EOF
  });

  test('should handle malformed attributes', () => {
    const input = '<div invalidAttr></div>';
    const tokenizer = new HTMLTokenizer(input);
    const { tokens, errors } = tokenizer.tokenize();

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toBe('Malformed attribute');
  });

  test('should respect preserveWhitespace option', () => {
    const input = ' \n \t ';
    const tokenizer = new HTMLTokenizer(input, { preserveWhitespace: true });
    const { tokens } = tokenizer.tokenize();

    expect(tokens.filter(t => t.type === 'Text')).toHaveLength(1);
  });

  test('should support XML mode', () => {
    const input = '<ns:tag></ns:tag>';
    const tokenizer = new HTMLTokenizer(input, { xmlMode: true });
    const { tokens } = tokenizer.tokenize();

    expect(tokens[0].namespace).toBe('ns');
  });

  test('should track line and column numbers', () => {
    const input = 'Hello\nWorld';
    const tokenizer = new HTMLTokenizer(input);
    const { tokens } = tokenizer.tokenize();

    expect(tokens[0]).toMatchObject({
      type: 'Text',
      line: 1,
      column: 1,
    });
    expect(tokens[1]).toMatchObject({
      type: 'Text',
      line: 2,
      column: 1,
    });
  });

  test('should track token positions', () => {
    const input = '<div>Test</div>';
    const tokenizer = new HTMLTokenizer(input);
    const { tokens } = tokenizer.tokenize();

    expect(tokens[0].start).toBe(0);
    expect(tokens[0].end).toBe(5);
  });
});
