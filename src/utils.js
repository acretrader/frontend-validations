export function isObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isString(value) {
  return typeof value === 'string' || value instanceof String;
}

export function startCase(string) {
  if (!isString(string)) return string;
  return string
  .replace(/[-_]/g, ' ')
  .replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

export function upperFirst(string) {
  if (!isString(string)) return string;
  return string.charAt(0).toUpperCase() + string.slice(1);
}
