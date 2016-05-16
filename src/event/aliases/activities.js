import { ALIAS_REQUEST_ACTIVITIES, load } from '../reducers/activities';

/**
 * Function that return react-redux-chrome alias object
 *
 * @param {Array} sessions
 * @param {String} token
 * @return {Object}
 */
export function aliasLoad(sessions, token) {
  return {
    type: ALIAS_REQUEST_ACTIVITIES,
    sessions,
    token,
  };
}

export default {
  [ALIAS_REQUEST_ACTIVITIES]: load
};
