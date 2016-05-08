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
    default:
      return state;
  }
};

/**
 * Load sessions from
 *
 * @param {Number} studentId
 */
export function load(studentId) {
  const params = objectToParams({
    count: 1000,
    offset: 0,
    search: 'tlk',
    student: studentId
  });

  debugger;
  return {
    types: [REQUEST_SESSION, REQUEST_SESSION_SUCCESS, REQUEST_SESSION_FAILURE],
    promise: (client) => client.get(`sessions?${params}`)
  };
}
