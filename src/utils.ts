export function isObject(value: any): boolean {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isString(value: any): boolean {
  return typeof value === 'string' || value instanceof String;
}

export function startCase(string: string): string {
  if (!isString(string)) return string;
  return string
  .replace(/[-_]/g, ' ')
  .replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

export function upperFirst(string: string): string {
  if (!isString(string)) return string;
  return string.charAt(0).toUpperCase() + string.slice(1);
}
