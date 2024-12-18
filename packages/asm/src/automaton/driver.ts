import { StateMachine } from './StateMachine';
import { StateMinimizer, Automaton } from './StateMinimizer';
import { StateMachineAST, StateMachineASTOptimizer, ASTNode } from './StateMachineAST';
import { StateMachineValidator } from './StateMachineValidator';

// Define a simple automaton
const automaton: Automaton = {
    states: ['q0', 'q1', 'q2'],
    initialState: 'q0',
    transitions: {
        'q0': { 'a': 'q1', 'b': 'q2' },
        'q1': { 'a': 'q0', 'b': 'q2' },
        'q2': { 'a': 'q2', 'b': 'q2' }
    },
    acceptingStates: ['q2']
};

// Validate the automaton
console.log('Validating Automaton:', StateMachineValidator.validateAutomaton(automaton));

// Minimize the automaton
const minimizer = new StateMinimizer(automaton);
const minimizedAutomaton = minimizer.minimize();
console.log('Minimized Automaton:', minimizedAutomaton);

// Define an AST for the state machine
const astRoot: ASTNode = {
    id: 'q0',
    transitions: {
        'a': 'q1',
        'b': 'q2'
    }
};

// Validate the AST
console.log('Validating AST:', StateMachineValidator.validateAST(astRoot));

// Optimize the AST using the minimized automaton
const optimizedAST = StateMachineASTOptimizer.optimizeAST(astRoot, minimizedAutomaton);
console.log('Optimized AST:', optimizedAST);

// Create a state machine instance
const stateMachine = new StateMachine('q0', [
    { from: 'q0', to: 'q1', on: 'a' },
    { from: 'q0', to: 'q2', on: 'b' },
    { from: 'q1', to: 'q0', on: 'a' },
    { from: 'q1', to: 'q2', on: 'b' },
    { from: 'q2', to: 'q2', on: 'a' },
    { from: 'q2', to: 'q2', on: 'b' }
]);

// Test state transitions
console.log('Initial State:', stateMachine.getCurrentState());
stateMachine.transition('a');
console.log('State after "a":', stateMachine.getCurrentState());
stateMachine.transition('b');
console.log('State after "b":', stateMachine.getCurrentState());

// Minimize the state machine
stateMachine.minimize();
console.log('State Machine after Minimization:', stateMachine);