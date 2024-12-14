import { HTMLTokenizer } from '../src/tokenizer/index';

describe('HTMLTokenizer', () => {
  it('should tokenize a simple HTML string', () => {
    const input = '<div class="test">Hello</div>';
    const tokenizer = new HTMLTokenizer(input);
    const tokens = tokenizer.tokenize();
    expect(tokens).toEqual([
      { type: 'StartTag', name: 'div', attributes: { class: 'test' } },
      { type: 'Text', value: 'Hello' },
      { type: 'EndTag', name: 'div' },
    ]);
  });
});
