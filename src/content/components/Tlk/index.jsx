import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { aliasLoad as aliasLoadSessions } from 'event/aliases/sessions';
import { aliasLoad as aliasLoadActivities } from 'event/aliases/activities';

import CourseSelector from './CourseSelector';
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

  render() {
    const {
      sessions,
      activities,
    } = this.props;

    const isLoading = this.isLoading();
    const hasCourses = this.sessionsHasCourses();

    return (
      <div>
        {isLoading && <span>Loading...</span>}
        {!isLoading && !hasCourses &&
          <CourseSelector sessions={sessions} />
        }
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
