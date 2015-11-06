'use strict';

module.exports = {
  throttle(func, time) {
    let timer = null;
    return () => {
      if (!timer) {
        timer = setTimeout(() => {
          timer = null;
        }, time);
        return func.apply(this, arguments);
      }
    };
  }
};
