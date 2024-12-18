import { Automaton } from './StateMinimizer';
import { ASTNode } from './StateMachineAST';
declare class StateMachineValidator {
    static validateAutomaton(automaton: Automaton): boolean;
    static validateAST(root: ASTNode): boolean;
}
export { StateMachineValidator };
//# sourceMappingURL=StateMachineValidator.d.ts.map