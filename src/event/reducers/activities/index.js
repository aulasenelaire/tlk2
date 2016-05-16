import _ from 'underscore';

export const ALIAS_REQUEST_ACTIVITIES = 'tlk2/actions/ALIAS_REQUEST_ACTIVITIES';
const REQUEST_ACTIVITY = 'tlk2/actions/REQUEST_ACTIVITY';
const REQUEST_ACTIVITY_SUCCESS = 'tlk2/actions/REQUEST_ACTIVITY_SUCCESS';
const REQUEST_ACTIVITY_FAILURE = 'tlk2/actions/REQUEST_ACTIVITY_FAILURE';

import CONSTANTS from 'constants';
import objectToParams from 'services/url-helpers';

const initialState = {
  loadingActivities: false,
  activities: {
    entities: [],
    bySessionId: {},
  },
};

export default (state = initialState, action) => {
  switch (action.type) {
    case REQUEST_ACTIVITY:
      return {
        ...state,
        loadingActivities: true,
      };

  case REQUEST_ACTIVITY_SUCCESS:
    // Remove old fetched sessions of that user
    const activities = _.flatten(_.pluck(action.result, 'activities'));
    const sessions = _.uniq(_.pluck(activities, 'session'));
    let newActivities = _.reject(state.activities.entities, (activity) => {
      return _.contains(sessions, activity.session);
    });

    newActivities = [
      ...newActivities,
      ...activities,
    ];

    return {
      ...state,
      loadingActivities: false,
      activities: {
        entities: newActivities,
        bySessionId: _.groupBy(newActivities, 'session')
      },
    };
    default:
      return state;
  }
};

/**
 * Make activity AJAX request. Then this is send in a Promise.all
 * to fetch all the activities
 *
 * @param {Integer} sessionId
 * @param {String} token
 * @param {Integer} sessionId
 * @param {Promise}
 */
function getActivityCall(client, token, sessionId) {
  const params = objectToParams({
    session: sessionId,
  });

  return client.get(`activities?${params}`, { token });
}

/**
 * Load sessions from
 *
 * @param {String} type
 * @param {Number} studentId
 * @param {String} token
 */
export function load({ type, sessions, token }) {
  return {
    types: [REQUEST_ACTIVITY, REQUEST_ACTIVITY_SUCCESS, REQUEST_ACTIVITY_FAILURE],
    promise: (client) => {
      const activitiesPromises = sessions.map((session) => {
        return getActivityCall(client, token, session.id);
      });

      return Promise.all(activitiesPromises);
    },
  };
}
