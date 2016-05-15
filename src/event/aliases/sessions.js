import { ALIAS_REQUEST_SESSIONS, load } from '../reducers/sessions';

/**
 * Function that return react-redux-chrome alias object
 *
 * @param {Number} studentId
 * @param {String} token
 * @return {Object}
 */
export function aliasLoad(studentId, token) {
  return {
    type: ALIAS_REQUEST_SESSIONS,
    studentId,
    token,
  };
}

export default {
  [ALIAS_REQUEST_SESSIONS]: load
};
