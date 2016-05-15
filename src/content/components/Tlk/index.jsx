import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { aliasLoad as aliasLoadSessions } from 'event/aliases/sessions';
/* import styles from './styles/'; */

class Tlk extends Component {
  componentWillMount() {
    const { studentId, dispatch } = this.props;

    dispatch(aliasLoadSessions(studentId, localStorage.token));
  }

  render() {
    const { loadingSessions } = this.props;
    return (
      <div>
        {loadingSessions && <span>Loading...</span>}
        {/* <h1>TLK</h1> */}
      </div>
    );
  }
}

Tlk.propTypes = {
  studentId: PropTypes.number.isRequired,
  sessions: PropTypes.array,
};

/**
 * Map action creators to component props
 *
 * @param {Object} state
 * @return {Object}
 */
function mapStateToProps(state) {
  return {
    sessions: state.sessionsReducer.sessions,
    loadingSessions: state.sessionsReducer.loadingSessions
  };
};

export default connect(mapStateToProps)(Tlk);
