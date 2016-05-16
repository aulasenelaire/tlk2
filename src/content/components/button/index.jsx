import React, { Component, PropTypes } from 'react';
import classNames from 'classnames/bind';

import styles from './styles/';
const cx = classNames.bind(styles);

class Button extends Component {
  getClasses() {
    const {
      size,
      buttonType,
      disabled,
      flat,
    } = this.props;

   return cx({
     btn: true,
     btn_Large: size === 'large',
     btn_Small: size === 'small',
     btn_ExtraSmall: size === 'extra_small',
     btn_Primary: buttonType === 'primary',
     btn_Danger: buttonType === 'danger',
     btn_Flat: flat,
     isDisabled: disabled,
    });
  }

  render() {
    const { children } = this.props;

    return (
      <button
        className={this.getClasses()}
        type='button'
      >
        {children}
      </button>
    );
  }
}

Button.propTypes = {
  loading: PropTypes.bool,
  size: PropTypes.string,
  buttonType: PropTypes.string,
  disabled: PropTypes.bool,
  flat: PropTypes.bool,
};

export default Button;
