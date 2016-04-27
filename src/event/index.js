import {createStore} from 'redux';
import rootReducer from './reducers';

import {wrapStore} from 'react-chrome-redux';
import CONSTANTS from '../constants';

const store = createStore(rootReducer, {});

wrapStore(store, {
  portName: CONSTANTS.CHROME_PORT,
});
