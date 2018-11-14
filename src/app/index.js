import { createComponent, useEffect, useCallback } from 'melody-hooks';
import { map, exhaustMap, mergeMap } from 'rxjs/operators';
import { ofType } from 'redux-observable';
import { createEpicEnhancer, useReduxStore } from './hooks';
import template from './index.melody.twig';

const initialState = {
    track: null,
    isLoading: true,
};

const reducer = (state, { type, payload }) => {
    switch (type) {
        case 'CHANGE_TRACK_REQUESTED':
            return {
                isLoading: true,
                track: null,
            };
        case 'TRACK_LOADED': {
            return {
                track: payload,
                isLoading: false,
            };
        }
        default:
            return state;
    }
};

const getRandomTrackId = () => Math.round(Math.random() * 200);
const buildApiUrl = trackId => `https://api.jamendo.com/v3.0/tracks/?client_id=d906e768&format=json&fuzzytags=rock+pop+country&include=musicinfo&audiodlformat=mp32&limit=1&offset=${trackId}`;

const appEpic = (actions, states) => {
    return actions.pipe(
        ofType('CHANGE_TRACK_REQUESTED'),
        map(({ payload }) => buildApiUrl(payload)),
        exhaustMap(url => fetch(url)),
        mergeMap(res => res.json()),
        map(data => data.results[0]),
        map(track => ({ type: 'TRACK_LOADED', payload: track })),
    );
}

const epicEnhancer = createEpicEnhancer(appEpic);

const requestNewTrack = store => {
    const trackId = getRandomTrackId();
    store.dispatch({ type: 'CHANGE_TRACK_REQUESTED', payload: trackId });
};

const App = (props) => {
    const store = useReduxStore(reducer, initialState, epicEnhancer);
    const nextTrack = useCallback(() => requestNewTrack(store), [store]);

    useEffect(() => requestNewTrack(store), [store]);

    const state = store.getState();
    return {
        ...state,
        nextTrack,
    };
};

export default createComponent(App, template);
