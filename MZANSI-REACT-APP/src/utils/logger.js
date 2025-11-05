
const isDevelopment = __DEV__;

class Logger {
  static log(...args) {
    if (isDevelopment) {
      console.log(...args);
    }
  }

  static warn(...args) {
    if (isDevelopment) {
      console.warn(...args);
    }
  }

  static error(...args) {

    console.error(...args);
  }

  static info(...args) {
    if (isDevelopment) {
      console.info(...args);
    }
  }

  static debug(...args) {
    if (isDevelopment) {
      console.debug(...args);
    }
  }
}

export default Logger;
