import { Validator } from "../src/validator";
describe("Validator", () => {
    test("should identify invalid declarations", () => {
        const ast = {
            type: "stylesheet",
            children: [
                {
                    type: "rule",
                    children: [
                        { type: "selector", value: "body", children: [] },
                        {
                            type: "declaration",
                            children: [{ type: "property", value: "color", children: [] }],
                        },
                    ],
                },
            ],
        };
        const validator = new Validator(ast);
        const errors = validator.validate();
        expect(errors).toContain("Missing or invalid value in declaration.");
    });
});
//# sourceMappingURL=validator.test.js.map