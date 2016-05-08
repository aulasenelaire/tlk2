import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { load as loadSessions } from '../../../event/reducers/sessions/';
/* import styles from './styles/'; */

class Tlk extends Component {
  componentWillMount() {
    const { studentId, loadSessions } = this.props;

    loadSessions(studentId);
  }

  render() {
    return (
      <div>
        {/* <h1>TLK</h1> */}
      </div>
    );
  }
}

Tlk.propTypes = {
  studentId: PropTypes.number.isRequired,
  sessions: PropTypes.array,
  loadSessions: PropTypes.func.isRequired,
};

/**
 * Map action creators to component props
 *
 * @param {Object} state
 * @return {Object}
 */
function mapStateToProps(state) {
  return {
    sessions: !state.sessionsReducer ? [] : state.sessionsReducer.sessions,
  };
};

/**
 * Map action creators to component props
 *
 * @param {Function} dispatch
 * @return {Object} props
 */
function mapDispatchToProps(dispatch) {
  return {
    loadSessions,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Tlk);
