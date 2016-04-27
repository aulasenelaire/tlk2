import { createStore, compose } from 'redux';
import persistState, { mergePersistedState } from 'redux-localstorage';
import adapter from 'redux-localstorage/lib/adapters/localStorage';
import filter from 'redux-localstorage-filter';
import {wrapStore} from 'react-chrome-redux';

import CONSTANTS from '../constants';
import rootReducer from './reducers';

const reducer = compose(
  mergePersistedState()
)(rootReducer);

const storage = compose(
  filter('count')
)(adapter(window.localStorage));

const createPersistentStore = compose(
  persistState(storage, 'tlk2-chrome-plugin')
)(createStore);

const store = createPersistentStore(reducer);

wrapStore(store, {
  portName: CONSTANTS.CHROME_PORT,
});
