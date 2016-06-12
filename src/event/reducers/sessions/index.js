import _ from 'underscore';

export const ALIAS_REQUEST_SESSIONS = 'tlk2/actions/ALIAS_REQUEST_SESSIONS';
const REQUEST_SESSION = 'tlk2/actions/REQUEST_SESSION';
const REQUEST_SESSION_SUCCESS = 'tlk2/actions/REQUEST_SESSION_SUCCESS';
const REQUEST_SESSION_FAILURE = 'tlk2/actions/REQUEST_SESSION_FAILURE';
const ALIAS_ADD_COURSE = 'tlk2/actions/ALIAS_ADD_COURSE';
const ADD_COURSE = 'tlk2/actions/ADD_COURSE';
import TLK_OLD from 'data/tlk_old.json';
import TLK from 'data/tlk.json';

import CONSTANTS from 'constants';
import objectToParams from 'services/url-helpers';
import { getCreationTime, getTrimester } from './services/time'

const initialState = {
  loadingSessions: false,
  sessions: {
    entities: [],
    byStudentId: {},
  },
};

let sessions;
let newSessions;

export default (state = initialState, action) => {
  switch (action.type) {
    case REQUEST_SESSION:
      return {
        ...state,
        loadingSessions: true,
      };

    case REQUEST_SESSION_SUCCESS:
      sessions = addMetadataAndFilter(action.result.sessions);

      // Remove old fetched sessions of that user
      newSessions = _.reject(state.sessions.entities, (session) => {
        return parseInt(session.student) === action.requestData.studentId;
      });

      newSessions = [
        ...newSessions,
        ...sessions,
      ];

      newSessions = _.sortBy(newSessions, function(session) {
        return session.tlk_metadata.creationTime.unix();
      });

      return {
        ...state,
        loadingSessions: false,
        sessions: {
          entities: newSessions,
          byStudentId: _.groupBy(newSessions, 'student')
        },
      };

    case ADD_COURSE:
      const { studentId, courses, activities } = action;
      sessions = calculatePercentils({
        sessions: state.sessions.entities,
        courses,
        studentId,
        activitiesBySessionId: activities,
      });

      // Remove old fetched sessions of that user
      newSessions = _.reject(state.sessions.entities, (session) => {
        return parseInt(session.student) === action.studentId;
      });

      newSessions = [
        ...newSessions,
        ...sessions,
      ];

      return {
          ...state,
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
 * Get TLK info based on session metadata
 *
 * @param {Object} meta
 * @return {Array}
 */
function getTlkForSession(meta) {
  const { tlk_key, trimester: {name }, course } = meta;
  const tlk = meta.tlk_key = 'TLK_OLD' ? TLK_OLD : TLK;

  return _.groupBy(
    _.filter(tlk, (row) => row.trimester === name && course === meta.course),
    'type');
}

/**
 * Get activities of that session grouped by silaba type
 *
 * @param {Object} session
 * @param {Object} activitiesBySessionID
 * @return {Array}
 */
function getActivitiesBySilabaType(session, activitiesBySessionId) {
  const silabas = session.tlk_metadata.silaba_types;
  const silabas_keys = _.keys(silabas);
  const activities = activitiesBySessionId[session.id];
  const activitiesBySilabaType = _.groupBy(activities, function(activity) {
    return _.find(silabas_keys, function(key) {
      return _.contains(silabas[key], activity.name);
    });
  });

  // Those are grouped under undefined key
  if (activitiesBySilabaType.undefined) {
    delete activitiesBySilabaType.undefined;
  }

  return activitiesBySilabaType;
}

/**
 * Generate percentils base on activity types
 *
 * @param {Object} activities
 * @param {Object} tlk
 * @return {Object}
 */
function generatePercentils(activities, tlk) {
  return _.reduce(_.keys(activities), function(memo, type) {
    const activitiesByType = activities[type];
    const activitiesWordsMinute = _.pluck(activitiesByType, 'words_minute');
    const tlkByActivityType = tlk[type][0];
    const activities_media = getMedia(activitiesWordsMinute);

    memo[type] = {
      activities_media,
      tlk_percentil: getPercentil(tlkByActivityType, activities_media)
    }

    return memo;
  }, {});
}

/**
 * Get media of an array of numbers
 *
 * @param {Array} values
 * @return {Number}
 */
function getMedia(values) {
  var count = values.length;
  var sum = _.reduce(values, function(memo, num){
    return memo + (+num);
  }, 0);
  return sum / count;
}

/**
 * Get percentil for that tlk session and activities media
 *
 * @param {Object} tlk
 * @param {Number} media
 * @return {Object}
 */
function getPercentil(tlk, media) {
  // remove keys that are not percentils like course, trimester,...
  var validTlkValues = _.reduce(tlk, function(memo, value, key) {
    if (/^p\d+$/.test(key)) {
      var num = value.replace(',', '.');
      memo[key] = parseFloat(num);
    }
    return memo
  }, {});

  var prevValue = {};
  var winner_percentil = {};
  var percentil = _.find(validTlkValues, function(value, key) {
    if (prevValue && (prevValue.value <= media && media < value)) {
      winner_percentil = {
        key: prevValue.key,
        value: prevValue.value
      };

      return true;
    }

    prevValue = {
      key: key,
      value: value
    };
  });

  return winner_percentil;
}

/**
 * Calculate percentils once we have course info
 *
 * @param {Object} options
 * @option {Array} sessions
 * @option {Object} courses
 * @option {Number} studentId
 * @option {Array} activitiesBySessionID
 * @return {Array}
 */
function calculatePercentils({ sessions, courses, studentId, activitiesBySessionId }) {
  const getPercentils = (courses, activitiesBySessionId) => (memo, session) => {
    const course = courses[session.id];

    if (course) {
      session.tlk_metadata.course = course;

      const meta = session.tlk_metadata;
      const tlk = getTlkForSession(meta);
      const activities = getActivitiesBySilabaType(session, activitiesBySessionId);

      session.tlk_metadata.percentils = generatePercentils(activities, tlk);

      memo.push(session);
    }

    return memo;
  };

  return _.chain(sessions)
          .filter((studentId) => (session) => parseInt(session.student) === studentId)
          .reduce(getPercentils(courses, activitiesBySessionId), [])
          .value();
}

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
      const creationTime = getCreationTime(session.creation_time);
      session.tlk_metadata.creationTime = creationTime;
      session.tlk_metadata.trimester = getTrimester(creationTime);
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

/**
 * Complete session with course information
 *
 * @param {Object} playload
 */
export function addCourse({ courses, studentId, activities }) {
  return {
    type: ADD_COURSE,
    courses,
    studentId,
    activities,
  };
}
