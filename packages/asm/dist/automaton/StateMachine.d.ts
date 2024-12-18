type State = string;
type Transition = {
    from: State;
    to: State;
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
    constructor(initialState: State, transitions: Transition[]);
    /**
     * Gets the current state of the state machine.
     * @returns The current state.
     */
    getCurrentState(): State;
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
export { StateMachine };
//# sourceMappingURL=StateMachine.d.ts.map