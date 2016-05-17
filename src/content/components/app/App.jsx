import React, {Component} from 'react';
import classNames from 'classnames/bind';
import _ from 'underscore';

import styles from './styles/';
const cx = classNames.bind(styles);

import Tlk from '../Tlk';

/**
 * Get class names
 *
 * @param {Boolean} isOpen
 * @return {Object}
 */
function getClasses(isOpen) {
  return cx({
    wrapper: true,
    isOpen: isOpen,
  });
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
      className: getClasses(isOpen),
    };

    if (!isOpen) {
      attrs = {
        ...attrs,
        onClick: this.onClickExpand,
      };
    };

    /* TODO: make backdrop layer  */
    {/* <div className={getClasses(isOpen)} onClick={this.onClickExpand}> */}
    return (
      <div {...attrs}>
        <div className={styles.app} style={getStyles(isOpen)}>
          <button onClick={this.onClickExpand} className={styles.triangle}>
            {isOpen && <span>x</span>}
          </button>

          {!isOpen && <div className={styles.info}>studentId: {studentId}</div>}

          {isOpen && <Tlk studentId={studentId} />}
        </div>
      </div>
    );
  }
}

export default App;
