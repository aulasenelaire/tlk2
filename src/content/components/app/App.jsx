import React, {Component} from 'react';
import _ from 'underscore';

import styles from './styles/';
import Tlk from '../Tlk';

/**
 * Get class names
 *
 * @param {Boolean} isOpen
 * @return {Object}
 */
function getClasses(isOpen) {
  const classes = [styles.app];

  if (!isOpen) return classes.join(' ');

  classes.push(styles.isOpen);
  return classes.join(' ');
}

/**
 * Get styles to animate expand/collapse of app
 *
 * @param {Boolean} isOpen
 * @return {Object}
 */
function getStyles(isOpen) {
  if (isOpen) {
    return {
      width: 500,
      bottom: 4,
    };
  }

  return {
    width: 180,
    bottom: 'auto',
  };
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      studentId: props.studentId,
    };

    this.onClickExpand = this.onClickExpand.bind(this);
  }

  componentDidMount() {
    window.addEventListener('urlChangeEvent', (event) => {
      const { studentId } = event.detail;

      this.setState({ isOpen: false, studentId});
    }, false);
  }

  componentWillUnmount() {
    window.removeEventListener('urlChangeEvent');
  }

  onClickExpand() {
    const { isOpen } = this.state;

    this.setState({ isOpen: !isOpen });
  }

  render() {
    const { isOpen, studentId } = this.state;

    if (!studentId) return null;

    let attrs = {
      ref: 'app',
      className: getClasses(isOpen),
      style: getStyles(isOpen),
    };

    if (!isOpen) {
      attrs = _.extend(attrs, {
        onClick: this.onClickExpand,
      });
    }

    return (
      <div {...attrs}>
        <button onClick={this.onClickExpand} className={styles.triangle}>
          {isOpen && <span>x</span>}
        </button>

        {!isOpen && <div className={styles.info}>studentId: {studentId}</div>}

        <Tlk studentId={studentId} />
      </div>
    );
  }
}

export default App;
