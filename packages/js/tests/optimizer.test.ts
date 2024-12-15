import { ASTOptimizer } from "../src/optimizer";
import { ASTNode } from "../src/ast";

describe('ASTOptimizer', () => {
    const optimizer = new ASTOptimizer();

    it('should optimize a constant declaration', () => {
        const ast: ASTNode = {
            type: "Program",
            children: [
                {
                    type: "VariableDeclaration",
                    value: "const",
                    children: [
                        {
                            type: "Identifier",
                            value: "x",
                            children: [], // Ensure this is included
                        },
                        {
                            type: "Literal",
                            value: "42",
                            children: [], // Ensure this is included
                        },
                    ],
                },
            ],
        };

        const optimizedAST = optimizer.optimize(ast);

        expect(optimizedAST).toEqual({
            type: "Program",
            children: [
                {
                    type: "InlineConstant",
                    value: "x=42",
                    children: [], // Ensure this is included
                },
            ],
        });
    });
});
