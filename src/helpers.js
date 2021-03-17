export const withParamsFuncName = '__validatorWithParams';

export function withParams(params, validator) {
  if (validator.name === withParamsFuncName) {
    const { $params, $validator } = validator();
    return withParams(Object.assign($params, params), $validator);
  }
  return function __validatorWithParams() {
    return {
      $params: params,
      $validator: (...args) => validator.apply(this, args),
    };
  };
}

export function getValidatorResult(validator, ...args) {
  if (validator.name === withParamsFuncName) {
    const { $validator } = validator();
    validator = $validator; // eslint-disable-line no-param-reassign
  }
  return validator(...args);
}
