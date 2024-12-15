// Automaton-related types
export type State = string; // States represented as strings
export type InputSymbol = string; // Input symbols for transitions

export interface TransitionFunction {
  [state: string]: {
    [input: string]: State; // Maps input symbols to next states
  };
}

export interface Automaton {
  states: State[]; // Set of all states
  initialState: State; // Initial state of the automaton
  transitions: TransitionFunction; // Transition function
  acceptingStates: State[]; // Set of accepting (final) states
}

// AST-related types
export interface ASTNode {
  id: string; // Unique identifier for the node
  value: string; // Value associated with the node (e.g., input symbol)
  transitions: {
    [input: string]: string; // Maps input symbols to child node IDs
  };
}

export interface MinimizedAutomaton {
  states: State[]; // Minimized set of states
  initialState: State; // Initial state of the minimized automaton
  transitions: TransitionFunction; // Minimized transition function
  acceptingStates: State[]; // Minimized set of accepting states
}
