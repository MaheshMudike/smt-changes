type Reducer<TState, TAction> = (state: TState, action: TAction) => TState;

export function composeReducers<TState, TAction>(
    defaultState: TState,
    first: Reducer<TState, TAction>,
    ...rest: Reducer<TState, TAction>[]
): Reducer<TState, TAction> {
    return rest.reduce(
        (acc, reducer) => (state = defaultState, action) => reducer(acc(state, action), action),
        (state = defaultState, action) => first(state, action),
    );
}
