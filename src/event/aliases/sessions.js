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
 * @param {Number} studentId
 * @param {Array} activities
 * @return {Object}
 */
export function aliasAddCourse(courses, studentId, activities) {
  return {
    type: ALIAS_ADD_COURSE,
    courses,
    studentId,
    activities,
  };
}

export default {
  [ALIAS_REQUEST_SESSIONS]: load,
  [ALIAS_ADD_COURSE]: addCourse,
};
