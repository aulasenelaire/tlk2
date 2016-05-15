export const ALIAS_REQUEST_SESSIONS = 'tlk2/actions/ALIAS_REQUEST_SESSIONS';
const REQUEST_SESSION = 'tlk2/actions/REQUEST_SESSION';
const REQUEST_SESSION_SUCCESS = 'tlk2/actions/REQUEST_SESSION_SUCCESS';
const REQUEST_SESSION_FAILURE = 'tlk2/actions/REQUEST_SESSION_FAILURE';

import CONSTANTS from 'constants';
import objectToParams from 'services/url-helpers';

const initialState = {
  loadingSessions: false,
  sessions: [],
};

export default (state = initialState, action) => {
  switch (action.type) {
    case REQUEST_SESSION:
      return {
        ...state,
        loadingSessions: true,
      };

  case REQUEST_SESSION_SUCCESS:
    return {
        ...state,
      loadingSessions: false,
    };
    default:
      return state;
  }
};

/**
 * Load sessions from
 *
 * @param {String} type
 * @param {Number} studentId
 * @param {String} token
 */
export function load({ type, studentId, token }) {
  const params = objectToParams({
    count: 1000,
    offset: 0,
    search: 'tlk',
    student: studentId
  });

  return {
    types: [REQUEST_SESSION, REQUEST_SESSION_SUCCESS, REQUEST_SESSION_FAILURE],
    promise: (client) => client.get(`sessions?${params}`, { token })
  };
}

