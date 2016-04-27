import React from 'react';
import {render} from 'react-dom';
import {Provider} from 'react-redux';
import {Store} from 'react-chrome-redux';

import CONSTANTS from '../constants';

import App from './components/app/App';

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.type == "request_info") {
    sendResponse({
      info: {
        token: localStorage.token,
      }
    });
  }
});

const proxyStore = new Store({portName: CONSTANTS.CHROME_PORT});

const anchor = document.createElement('div');
const ANCHOR_ID = 'tlk2';
anchor.id = ANCHOR_ID;

document.body.insertBefore(anchor, document.body.childNodes[0]);

render(
  <Provider store={proxyStore}>
    <App/>
  </Provider>
  , document.getElementById(ANCHOR_ID));
