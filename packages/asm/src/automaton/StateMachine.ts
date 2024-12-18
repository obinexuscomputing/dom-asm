type State = string;
type Transition = {
    from: State;
    to: State;
    on: string;
};

/**
 * Represents a finite state machine.
 */
class StateMachine {
    private currentState: State;
    private transitions: Transition[];

    /**
     * Creates an instance of StateMachine.
     * @param initialState - The initial state of the state machine.
     * @param transitions - An array of transitions that define the state machine's behavior.
     */
    constructor(initialState: State, transitions: Transition[]) {
        this.currentState = initialState;
        this.transitions = transitions;
    }

    /**
     * Gets the current state of the state machine.
     * @returns The current state.
     */
    public getCurrentState(): State {
        return this.currentState;
    }

    /**
     * Transitions the state machine to a new state based on the given event.
     * @param event - The event that triggers the transition.
     * @throws Will throw an error if the transition is invalid.
     */
    public transition(event: string): void {
        const transition = this.transitions.find(
            (t) => t.from === this.currentState && t.on === event
        );

        if (transition) {
            this.currentState = transition.to;
        } else {
            throw new Error(`Invalid transition from ${this.currentState} on ${event}`);
        }
    }
}

export default StateMachine;