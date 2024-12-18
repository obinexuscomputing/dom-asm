import { MinimizedAutomaton } from "./StateMinimizer";
interface ASTNode {
    id: string;
    transitions: {
        [key: string]: string;
    };
}
declare class StateMachineAST {
    private root;
    private automaton;
    constructor(root: ASTNode, automaton: MinimizedAutomaton);
    optimizeAST(): ASTNode;
}
declare class StateMachineASTOptimizer {
    static optimizeAST(root: ASTNode, automaton: MinimizedAutomaton): ASTNode;
}
export { StateMachineAST, StateMachineASTOptimizer, ASTNode };
//# sourceMappingURL=StateMachineAST.d.ts.map