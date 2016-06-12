import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { aliasLoad as aliasLoadSessions, aliasAddCourse } from 'event/aliases/sessions';
import { aliasLoad as aliasLoadActivities } from 'event/aliases/activities';

import CourseSelector from './CourseSelector';
import Percentils from './Percentils';
/* import styles from './styles/'; */

class Tlk extends Component {
  componentWillMount() {
    const { studentId, dispatch } = this.props;

    dispatch(aliasLoadSessions(studentId, localStorage.token));
  }

  componentWillReceiveProps(nextProps) {
    const { loadingSessions, dispatch } = this.props;
    const { loadingSessions: nextLoadingSessions, sessions } = nextProps;

    if (loadingSessions && !nextLoadingSessions && sessions.length) {
      dispatch(aliasLoadActivities(sessions, localStorage.token));
    }
  }

  isLoading() {
    const {
      loadingSessions,
      loadingActivities,
      sessions,
    } = this.props;

    return !sessions || loadingSessions || loadingActivities;
  }

  addCourses(courses) {
    const { dispatch, studentId, activities } = this.props;

    dispatch(aliasAddCourse(courses, studentId, activities));
  }

  /**
   * Check if sessions have course information
   *
   * @return {Boolean}
   */
  sessionsHasCourses() {
    const { sessions } = this.props;

    if (!sessions || !sessions.length) return false;

    const session = sessions[0];

    return !!session.tlk_metadata.course;
  }

  /**
   * Render sessions. If no course render CourseSelector
   * else percentils results of the session
   *
   * @param {Boolean} isLoading
   * @param {Boolean} isLoading
   */
  renderSession(isLoading) {
    if (isLoading) return null;

    const hasCourses = this.sessionsHasCourses();
    const { sessions } = this.props;

    if (!hasCourses) {
      return (
        <CourseSelector sessions={sessions} addCourses={this.addCourses.bind(this)} />
      );
    }

    return (
      <Percentils sessions={sessions} />
    );
  }

  render() {
    const {
      sessions,
      activities,
    } = this.props;

    const isLoading = this.isLoading();

    return (
      <div>
        {isLoading && <span>Loading...</span>}

        {this.renderSession(isLoading)}
      </div>
    );
  }
}

Tlk.propTypes = {
  studentId: PropTypes.number.isRequired,
  sessions: PropTypes.array,
  activities: PropTypes.object,
  loadingSessions: PropTypes.bool.isRequired,
  loadingActivities: PropTypes.bool.isRequired,
};

/**
 * Map action creators to component props
 *
 * @param {Object} state
 * @param {Object} ownProps
 * @return {Object}
 */
function mapStateToProps(state, ownProps) {
  const { studentId } = ownProps;

  return {
    sessions: state.sessionsReducer.sessions.byStudentId[studentId],
    activities: state.activitiesReducer.activities.bySessionId,
    loadingSessions: state.sessionsReducer.loadingSessions,
    loadingActivities: state.activitiesReducer.loadingActivities,
  };
};

export default connect(mapStateToProps)(Tlk);
