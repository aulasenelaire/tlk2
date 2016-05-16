import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { aliasLoad as aliasLoadSessions } from 'event/aliases/sessions';
import { aliasLoad as aliasLoadActivities } from 'event/aliases/activities';
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
    } = this.props;

    return loadingSessions || loadingActivities;
  }

  render() {
    const {
      sessions,
      activities,
    } = this.props;

    let act;
    if (sessions && sessions[0]) {
      act = activities[sessions[0].id];
    }

    return (
      <div>
        {this.isLoading() && <span>Loading...</span>}
        {sessions && sessions[0] &&
         <span>Session: {sessions[0].id}</span>
        }
        {sessions && sessions[0] && sessions[0].tlk_metadata && sessions[0].tlk_metadata.creationTime &&
         <div>
           Trimester:
           {/* {sessions[0].tlk_metadata.creationTime.format('YYYY-MM-DD')} */}
           <br/>
           {sessions[0].tlk_metadata.trimester.name}
           <br/>
         </div>
        }
         {act && act[0] &&
          <span><br />Activity: {act[0].id}</span>
         }
        {/* <h1>TLK</h1> */}
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
