import React, {Component} from 'react';
import {connect} from 'react-redux';

import styles from './styles/';

const COLLAPSED_WIDTH = 150;
const EXPANDED_WIDTH = 500;
const COLLAPSED_HEIGHT = 'auto';
const EXPANDED_HEIGHT = '100%';
const COLLAPSED_STYLES = {
  width: COLLAPSED_WIDTH,
  height: COLLAPSED_HEIGHT,
};
const EXPANDED_STYLES = {
  width: EXPANDED_WIDTH,
  height: EXPANDED_HEIGHT,
};

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
      before: COLLAPSED_STYLES,
      after: EXPANDED_STYLES,
    };
  }

  return {
    before: EXPANDED_STYLES,
    after: COLLAPSED_STYLES,
  };
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
    };

    this.onClickExpand = this.onClickExpand.bind(this);
  }
  componentDidMount() {
    document.addEventListener('click', () => {
      this.props.dispatch({
        type: 'ADD_COUNT'
      });
    });
  }

  componentDidUpdate() {
    const { isOpen } = this.state;
    const domNode = this.refs.app;
    const inlineStyles = getStyles(isOpen);

    domNode.style.width = `${inlineStyles.before.width}px`;
    domNode.style.height = inlineStyles.before.height;
    window.requestAnimationFrame(function() {
      domNode.style.transition = 'width 250ms';
      domNode.style.width = `${inlineStyles.after.width}px`;
      domNode.style.height = inlineStyles.after.height;
    });
  }

  onClickExpand() {
    const { isOpen } = this.state;

    this.setState({ isOpen: !isOpen });
  }

  render() {
    const { isOpen } = this.state;

    return (
      <div ref='app' className={getClasses(isOpen)}>
        <h1>Resultados TLK</h1>
        Count: {this.props.count}
        <button onClick={this.onClickExpand} className={styles.triangle} />
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    count: state.count
  };
};

export default connect(mapStateToProps)(App);
