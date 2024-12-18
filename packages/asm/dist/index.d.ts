type State$1 = string;
type Transition = {
    from: State$1;
    to: State$1;
    on: string;
};
/**
 * Represents a finite state machine.
 */
declare class StateMachine {
    private currentState;
    private transitions;
    private states;
    private alphabet;
    /**
     * Creates an instance of StateMachine.
     * @param initialState - The initial state of the state machine.
     * @param transitions - An array of transitions that define the state machine's behavior.
     */
    constructor(initialState: State$1, transitions: Transition[]);
    /**
     * Gets the current state of the state machine.
     * @returns The current state.
     */
    getCurrentState(): State$1;
    /**
     * Transitions the state machine to a new state based on the given event.
     * @param event - The event that triggers the transition.
     * @throws Will throw an error if the transition is invalid.
     */
    transition(event: string): void;
    /**
     * Minimizes the state machine by merging equivalent states.
     */
    minimize(): void;
    private isFinalState;
    private areEquivalent;
    private getNextState;
    private inSamePartition;
    private updateTransitions;
}

type State = string;
interface TransitionFunction {
    [state: string]: {
        [input: string]: State;
    };
}
interface Automaton {
    states: State[];
    initialState: State;
    transitions: TransitionFunction;
    acceptingStates: State[];
}
interface MinimizedAutomaton {
    states: State[];
    initialState: State;
    transitions: TransitionFunction;
    acceptingStates: State[];
}
declare class StateMinimizer {
    private automaton;
    constructor(automaton: Automaton);
    /**
     * Minimizes the given automaton using state minimization algorithm.
     * @returns The minimized automaton.
     */
    minimize(): MinimizedAutomaton;
    /**
     * Initializes the partitions of states into accepting and non-accepting states.
     * @param states All states of the automaton.
     * @param acceptingStates The accepting states of the automaton.
     * @returns The initial partitions of states.
     */
    private initializePartitions;
    /**
     * Splits the partitions based on the transition function.
     * @param partitions The current partitions of states.
     * @param transitions The transition function of the automaton.
     * @returns The new partitions after splitting.
     */
    private splitPartitions;
    /**
     * Finds the representative state of the partition that contains the given state.
     * @param partitions The partitions of states.
     * @param state The state to find the representative for.
     * @returns The representative state of the partition.
     */
    private findPartitionRepresentative;
}

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

export { StateMachine, StateMachineAST, StateMachineASTOptimizer, StateMinimizer };
