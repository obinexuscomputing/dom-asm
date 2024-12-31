
import {HTMLTokenizer} from '../src/tokenizer/HTMLTokenizer'
describe('HTMLTokenizer', () => {
    describe('Attribute Handling', () => {
        it('should parse attributes correctly', () => {
            const input = '<div class="test" id="123">';
            const tokenizer = new HTMLTokenizer(input);

            const { tokens, errors } = tokenizer.tokenize();

            expect(errors).toHaveLength(0); // Check that there are no errors
            expect(tokens[0].type).toBe('StartTag'); // Verify token type
            expect(tokens[0].attributes).toEqual(
                new Map([
                    ['class', 'test'],
                    ['id', '123']
                ]) // Ensure attributes are parsed correctly
            );
        });
    });

    describe('Special Elements', () => {
        let tokenizer;

        test('should handle comments', () => {
            tokenizer = new HTMLTokenizer('<!-- Test Comment -->');
            const { tokens } = tokenizer.tokenize();

            expect(tokens).toHaveLength(1);
            expect(tokens[0]).toMatchObject({
                type: 'Comment',
                data: 'Test Comment'
            });
        });

        test('should handle conditional comments', () => {
            tokenizer = new HTMLTokenizer('<!--[if IE]>Test<![endif]-->');
            const { tokens } = tokenizer.tokenize();

            expect(tokens[0]).toMatchObject({
                type: 'Comment',
                data: '[if IE]>Test<![endif]'
            });
        });

        test('should handle doctype', () => {
            tokenizer = new HTMLTokenizer('<!DOCTYPE html>');
            const { tokens } = tokenizer.tokenize();

            expect(tokens[0]).toMatchObject({
                type: 'Doctype',
                name: 'html'
            });
        });
    });

    describe('Error Handling', () => {
        it('should handle unclosed tags', () => {
            const input = '<div class="test">'; // Missing closing </div>
            const tokenizer = new HTMLTokenizer(input);

            const { tokens, errors } = tokenizer.tokenize();

            expect(errors).toHaveLength(1); // Expecting one error for unclosed tag
            expect(errors[0].message).toBe('Unexpected end of input in tag div'); // Verify error message

            expect(tokens).toHaveLength(2); // StartTag + EOF
            expect(tokens[1].type).toBe('EOF'); // Ensure EOF token is emitted
        });
    });
});
