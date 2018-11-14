import { useRef, useState, useEffect } from 'melody-hooks';
import { createStore, applyMiddleware } from 'redux';
import { createEpicMiddleware } from 'redux-observable';

export const useReduxStore = (reducer, initialState, enhancer) => {
    const storeRef = useRef(null);
    const [state, setState] = useState(initialState);
    let store = storeRef.current;
    if (store === null) {
        storeRef.current = store = createStore(reducer, initialState, enhancer);
    }
    useEffect(() => store.subscribe(
        () => setState(store.getState())
    ), [store]);
    return storeRef.current;
};

export const createEpicEnhancer = (epic, options) => createStore => {
    const middleware = createEpicMiddleware(options);
    const enhancer = applyMiddleware(middleware);
    return (...args) => {
        const store = enhancer(createStore)(...args);
        middleware.run(epic);
        return store;
    };
};
