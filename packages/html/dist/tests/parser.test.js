"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = require("../src");
describe("Parser with Error Handler", () => {
    it("should invoke custom error handler for unmatched end tags", () => {
        const input = `
      <div>
        <span>Hello</span>
        </mismatch>
      </div>
    `;
        const parser = new src_1.Parser({ throwOnError: false });
        const mockErrorHandler = jest.fn();
        parser.setErrorHandler(mockErrorHandler);
        const ast = parser.parse(input);
        expect(mockErrorHandler).toHaveBeenCalled();
        expect(mockErrorHandler.mock.calls[0][0]).toBeInstanceOf(src_1.ParserError);
    });
    it("should recover and continue parsing after an error", () => {
        const input = `
      <div>
        <span>Hello</span>
        </mismatch>
      </div>
    `;
        const parser = new src_1.Parser({ throwOnError: false });
        const ast = parser.parse(input);
        // Verify the valid parts of the AST are preserved
        const divNode = ast.children[0];
        expect(divNode.name).toBe("div");
        expect(divNode.children[1].name).toBe("span");
    });
});
