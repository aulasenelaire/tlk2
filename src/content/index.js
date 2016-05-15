import 'babel-polyfill';

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { Store } from 'react-chrome-redux';

import CONSTANTS from '../constants';
import TLK_OLD from 'data/tlk_old.json';
import TLK from 'data/tlk.json';

import App from './components/app/App';
import getStudentId from 'services/student-id';

const studentId = getStudentId(document.location.pathname);

const anchor = document.createElement('div');
const ANCHOR_ID = 'tlk2';
anchor.id = ANCHOR_ID;
document.body.insertBefore(anchor, document.body.childNodes[0]);

/**
 * Renden app if there is a valid student ID
 *
 * @param {Maybe<Number>} studentId
 */
function renderApp(studentId) {
  const proxyStore = new Store({portName: CONSTANTS.CHROME_PORT});

  // Wait for background store to be loaded
  const unsubscribe = proxyStore.subscribe(() => {
    unsubscribe(); // make sure to only fire once
    render(
      <Provider store={proxyStore}>
        <App
          studentId={studentId}
          userToken={localStorage.token}
        />
      </Provider>,
      document.getElementById(ANCHOR_ID)
    );
  });
}

renderApp(studentId);


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    window.dispatchEvent(new CustomEvent('urlChangeEvent', {
      'detail': { studentId: request.studentId },
    }));
  }
);
