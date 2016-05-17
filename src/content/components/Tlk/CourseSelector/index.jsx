import React, { Component, PropTypes } from 'react';
import _ from 'underscore';
import moment from 'moment';

import CONSTANTS from 'constants';
import Button from '../../button';
import styles from './styles/';

const NO_COURSE = 'no_course';

function getValue(event) {
  const { value } = event.target;
  return value;
}

function getSelectedValue(selectedCourseBySessionId, generalSelector) {
  if (!selectedCourseBySessionId) return generalSelector;

  return selectedCourseBySessionId;
}

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
    const value = getValue(event);
    const { selectedCourses } = this.state;
    const { sessions } = this.props;
    const selectedCoursesIds = _.keys(selectedCourses);
    const ids = _.reject(_.pluck(sessions, 'id'), (id) => {
      return _.contains(selectedCoursesIds, id);
    });

    let newSelected = {};
    if (value !== NO_COURSE) {
      newSelected = _.reduce(ids, (acc, id) => {
        acc[id] = value;
        return acc;
      }, {});
    }

    const newSelectedCourses = {
      ...selectedCourses,
      ...newSelected,
    };

    this.setState({generalSelector: value});
    this.setState({selectedCourses: newSelectedCourses});
  }

  onChangeSessionCourse(sessionId, event) {
    const { selectedCourses } = this.state;
    const value = getValue(event);

    let newSelectedCourses = {
      ...selectedCourses,
      [sessionId]: value,
    };

    if (value === NO_COURSE) {
      newSelectedCourses = _.omit(newSelectedCourses, sessionId);
    }

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
      const selectedValue = selectedCourses[session.id];

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
