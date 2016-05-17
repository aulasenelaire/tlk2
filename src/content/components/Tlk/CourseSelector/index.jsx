import React, { Component, PropTypes } from 'react';
import moment from 'moment';

import CONSTANTS from 'constants';
import Button from '../../button';
import styles from './styles/';

const NO_COURSE = 'no_course';

class CourseSelector extends Component {
  constructor() {
    super();
    this.state = {
      error: null,
      selectedCourses: {},
      generalSelector: null,
    };

    this.onChangeGeneralSelector = this.onChangeGeneralSelector.bind(this);
  }

  onChangeGeneralSelector(event) {
    this.setState({generalSelector: event.target.value});
  }

  onChangeSessionCourse(sessionId, event) {
    const { selectedCourses } = this.state;
    const newSelectedCourses = {
      ...selectedCourses,
      [sessionId]: event.target.value,
    };
    this.setState({selectedCourses: newSelectedCourses});
  }

  render() {
    const {
      sessions,
      courses,
    } = this.props;
    const { error, generalSelector, selectedCourses } = this.state;
    const { COURSES_NAMES } = CONSTANTS;


    const sessionRows = sessions.map((session) => {
      const creationTime = moment(session.tlk_metadata.creationTime).format('DD-MM-YYYY');
      const selectedValue = selectedCourses[session.id] ? selectedCourses[session.id] : generalSelector;

      return (
        <li key={session.id} className={styles.item}>
          <div className={styles.sessionName}>
            {session.name}
            <small>Sesion: <strong>{session.id}</strong></small>
          </div>
          <div className={styles.courseSelector}>
            <small>{creationTime}</small>
            <select onChange={this.onChangeSessionCourse.bind(this, session.id)} value={selectedValue}>
              <option value={NO_COURSE}>Elige curso</option>
              {COURSES_NAMES.map((course) => {
                return (
                  <option key={course} value={course}>{course}</option>
                );
              })}
            </select>
          </div>
        </li>
      );
    });

    return (
      <div>
        <h1>Assigna los cursos</h1>

        {error &&
          <div className={styles.error}>{error}</div>
        }

        <div className={styles.allInOneCourseSelector}>
          <select onChange={this.onChangeGeneralSelector} value={generalSelector}>
            <option value={NO_COURSE}>Todas las sessiones el mismo curso. Elige</option>
            {COURSES_NAMES.map((course) => {
              return (
                <option key={course} value={course}>{course}</option>
              );
            })}
          </select>
        </div>

        <ul className={styles.list}>
          {sessionRows}
        </ul>

        <Button flat={true} buttonType='primary'>Asignar curso</Button>
      </div>
    );
  }
}

CourseSelector.propTypes = {
  sessions: PropTypes.array.isRequired,
};

export default CourseSelector;
