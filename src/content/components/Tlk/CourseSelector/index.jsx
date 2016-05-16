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
    };
  }

  render() {
    const {
      sessions,
      courses,
    } = this.props;
    const { error } = this.state;
    const { COURSES_NAMES } = CONSTANTS;


    const sessionRows = sessions.map((session) => {
      const creationTime = moment(session.tlk_metadata.creationTime).format('DD-MM-YYYY');

      return (
        <li key={session.id} className={styles.item}>
          <div className={styles.sessionName}>
            {session.name}
            <small>Sesion: <strong>{session.id}</strong></small>
          </div>
          <div className={styles.courseSelector}>
            <small>{creationTime}</small>
            <select>
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
          <select>
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
