import { createStore, compose } from 'redux';
import persistState, { mergePersistedState } from 'redux-localstorage';
import adapter from 'redux-localstorage/lib/adapters/localStorage';
import filter from 'redux-localstorage-filter';
import {wrapStore} from 'react-chrome-redux';

import CONSTANTS from '../constants';
import getStudentId from 'services/student-id';
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

chrome.webNavigation.onHistoryStateUpdated.addListener(function(details) {
  const { url, tabId } = details;
  const studentId = getStudentId(details.url);

  // Select active tab and send studentId to content_script
  chrome.tabs.sendMessage(tabId, { studentId }, null);
});
