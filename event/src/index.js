import {createStore} from 'redux';
import rootReducer from './reducers';

import {wrapStore} from 'react-chrome-redux';

// import { CHROME_PORT } from '../../content/constants';

const store = createStore(rootReducer, {});

debugger;
wrapStore(store, {
  portName: 'tlk2',
});
