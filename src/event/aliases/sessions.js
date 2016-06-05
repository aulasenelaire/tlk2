import {
  ALIAS_REQUEST_SESSIONS,
  ALIAS_ADD_COURSE,
  load,
  addCourse,
} from '../reducers/sessions';

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

/**
 * Add course info
 *
 * @param {Object} courses
 * @return {Object}
 */
export function aliasAddCourse(courses) {
  return {
    type: ALIAS_ADD_COURSE,
    courses: courses,
  };
}

export default {
  [ALIAS_REQUEST_SESSIONS]: load,
  [ALIAS_ADD_COURSE]: addCourse,
};
