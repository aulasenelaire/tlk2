import _ from 'underscore';

export const ALIAS_REQUEST_SESSIONS = 'tlk2/actions/ALIAS_REQUEST_SESSIONS';
const REQUEST_SESSION = 'tlk2/actions/REQUEST_SESSION';
const REQUEST_SESSION_SUCCESS = 'tlk2/actions/REQUEST_SESSION_SUCCESS';
const REQUEST_SESSION_FAILURE = 'tlk2/actions/REQUEST_SESSION_FAILURE';

import CONSTANTS from 'constants';
import objectToParams from 'services/url-helpers';

const initialState = {
  loadingSessions: false,
  sessions: {
    entities: [],
    byStudentId: {},
  },
};

export default (state = initialState, action) => {
  switch (action.type) {
    case REQUEST_SESSION:
      return {
        ...state,
        loadingSessions: true,
      };

  case REQUEST_SESSION_SUCCESS:
    const sessions = addMetadataAndFilter(action.result.sessions);
    // Remove old fetched sessions of that user
    let newSessions = _.reject(state.sessions.entities, (session) => {
      return parseInt(session.student) === action.requestData.studentId;
    });

    newSessions = [
      ...newSessions,
      ...sessions,
    ];

    return {
      ...state,
      loadingSessions: false,
      sessions: {
        entities: newSessions,
        byStudentId: _.groupBy(newSessions, 'student')
      },
    };
    default:
      return state;
  }
};

/**
 * Filter invalid sessions and add metadata
 *
 * @param {Array} sessions
 * @return {Array}
 */
function addMetadataAndFilter(sessions) {
  return _.reduce(sessions, (memo, session) => {
    const metadata = _.find(CONSTANTS.SESSION_TYPES, (type) => {
      return type.regexp.test(session.name);
    });

    if (metadata) {
      session.tlk_metadata = metadata;
      memo.push(session);
    }

    return memo;
  }, []);
}

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
    promise: (client) => client.get(`sessions?${params}`, { token }),
    requestData: {
      studentId,
    },
  };
}

