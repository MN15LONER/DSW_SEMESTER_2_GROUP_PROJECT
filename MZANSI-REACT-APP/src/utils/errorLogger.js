
const MAX_LOGS_PER_MESSAGE = 5;
const LOG_TTL_MS = 60 * 1000; // reset counts after 60s

const _counts = new Map();
const _timestamps = new Map();

function _shouldLog(key) {
  const now = Date.now();
  const last = _timestamps.get(key) || 0;
  if (now - last > LOG_TTL_MS) {
    _counts.set(key, 0);
  }
  _timestamps.set(key, now);

  const count = (_counts.get(key) || 0) + 1;
  _counts.set(key, count);
  return count <= MAX_LOGS_PER_MESSAGE;
}

export function logError(tag, error) {

  if (typeof __DEV__ !== 'undefined' && !__DEV__) return;

  const key = `${tag}:${(error && error.message) || String(error)}`;
  if (_shouldLog(key)) {
    try {
      console.error(tag, error);
      const count = _counts.get(key);
      if (count === MAX_LOGS_PER_MESSAGE) {
        console.error(`${tag} — further identical messages will be suppressed for ${LOG_TTL_MS / 1000}s`);
      }
    } catch (e) {

    }
  }
}

export function logWarn(tag, message) {
  if (typeof __DEV__ !== 'undefined' && !__DEV__) return;
  const key = `${tag}:${String(message)}`;
  if (_shouldLog(key)) {
    try {
      console.warn(tag, message);
    } catch (e) {}
  }
}

export function logInfo(tag, message) {
  if (typeof __DEV__ !== 'undefined' && !__DEV__) return;
  const key = `${tag}:${String(message)}`;
  if (_shouldLog(key)) {
    try {
      console.log(tag, message);
    } catch (e) {}
  }
}

export default { logError, logWarn, logInfo };
