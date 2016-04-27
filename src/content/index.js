import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { Store } from 'react-chrome-redux';

import CONSTANTS from '../constants';
import TLK_OLD from 'data/tlk_old.json';
import TLK from 'data/tlk.json';

import App from './components/app/App';
import getStudentId from './services/student-id';

/**
 * Renden app if there is a valid student ID
 */
function renderApp() {
  const studentId = getStudentId(document.location.pathname);
  if (!studentId) return;

  const proxyStore = new Store({portName: CONSTANTS.CHROME_PORT});

  const anchor = document.createElement('div');
  const ANCHOR_ID = 'tlk2';
  anchor.id = ANCHOR_ID;

  document.body.insertBefore(anchor, document.body.childNodes[0]);

  render(
    <Provider store={proxyStore}>
      <App
        studentId={studentId}
        userToken={localStorage.token}
      />
    </Provider>,
    document.getElementById(ANCHOR_ID)
  );
}

renderApp();
