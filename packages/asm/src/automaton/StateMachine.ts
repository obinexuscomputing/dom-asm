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
    private states: Set<State>;
    private alphabet: Set<string>;

    /**
     * Creates an instance of StateMachine.
     * @param initialState - The initial state of the state machine.
     * @param transitions - An array of transitions that define the state machine's behavior.
     */
    constructor(initialState: State, transitions: Transition[]) {
        this.currentState = initialState;
        this.transitions = transitions;
        this.states = new Set(transitions.flatMap(t => [t.from, t.to]));
        this.alphabet = new Set(transitions.map(t => t.on));
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

    /**
     * Minimizes the state machine by merging equivalent states.
     */
    public minimize(): void {
        const partitions: Set<Set<State>> = new Set();
        const nonFinalStates = new Set([...this.states].filter(s => !this.isFinalState(s)));
        const finalStates = new Set([...this.states].filter(s => this.isFinalState(s)));

        partitions.add(nonFinalStates);
        partitions.add(finalStates);

        let changed = true;
        while (changed) {
            changed = false;
            for (const partition of partitions) {
                const [first, ...rest] = [...partition];
                const newPartitions: Set<Set<State>> = new Set();
                const newPartition = new Set([first]);

                for (const state of rest) {
                    if (this.areEquivalent(first, state, partitions)) {
                        newPartition.add(state);
                    } else {
                        newPartitions.add(new Set([state]));
                        changed = true;
                    }
                }

                if (newPartitions.size > 0) {
                    partitions.delete(partition);
                    partitions.add(newPartition);
                    for (const newPart of newPartitions) {
                        partitions.add(newPart);
                    }
                }
            }
        }

        this.updateTransitions(partitions);
    }

    private isFinalState(state: State): boolean {
        // Implement logic to determine if a state is a final state
        return false;
    }

    private areEquivalent(state1: State, state2: State, partitions: Set<Set<State>>): boolean {
        for (const symbol of this.alphabet) {
            const next1 = this.getNextState(state1, symbol);
            const next2 = this.getNextState(state2, symbol);
            if (next1 !== next2 && !this.inSamePartition(next1, next2, partitions)) {
                return false;
            }
        }
        return true;
    }

    private getNextState(state: State, symbol: string): State | null {
        const transition = this.transitions.find(t => t.from === state && t.on === symbol);
        return transition ? transition.to : null;
    }

    private inSamePartition(state1: State | null, state2: State | null, partitions: Set<Set<State>>): boolean {
        if (state1 === state2) return true;
        for (const partition of partitions) {
            if (partition.has(state1!) && partition.has(state2!)) {
                return true;
            }
        }
        return false;
    }

    private updateTransitions(partitions: Set<Set<State>>): void {
        const stateMap = new Map<State, State>();
        for (const partition of partitions) {
            const [representative] = [...partition];
            for (const state of partition) {
                stateMap.set(state, representative);
            }
        }

        this.transitions = this.transitions.map(t => ({
            from: stateMap.get(t.from)!,
            to: stateMap.get(t.to)!,
            on: t.on
        }));

        this.states = new Set(stateMap.values());
        this.currentState = stateMap.get(this.currentState)!;
    }
}

export default StateMachine;