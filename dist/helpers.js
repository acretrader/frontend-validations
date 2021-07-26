import { upperFirst } from './utils';
import * as validatorsImport from './validators';
import * as errorMessagesImport from './error-messages';
const validators = validatorsImport;
const errorMessages = errorMessagesImport;
export const req = (value) => {
    if (Array.isArray(value))
        return !!value.length;
    if (value === undefined || value === null) {
        return false;
    }
    if (value === false) {
        return true;
    }
    if (value instanceof Date) {
        // invalid date won't pass
        return !Number.isNaN(value.getTime());
    }
    return !!String(value).trim().length;
};
/**
 * Add some params to rules. It can be useful to handle field validation error etc
 * @param params
 * @param validator
 */
export function withParams(params, validator) {
    if (validator.__params) {
        Object.assign(validator.__params, params);
        return validator;
    }
    else {
        const validatorProxy = (...args) => validator.apply(this, args);
        validatorProxy.__params = params;
        return validatorProxy;
    }
}
/**
 * Get validator by validator name
 * @param valName
 * @returns {*}
 */
export function getValidator(valName) {
    const validator = validators[valName];
    if (validator) {
        return validator;
    }
    return false;
    // throw new Error(`Undefined validator ${valName}`);
}
/**
 * Get rules for field by params from api
 * @param params
 * @param fieldName
 */
export function getSingleFieldRulesByParams(params = {}, fieldName) {
    const fieldRules = {};
    Object.entries(params).forEach(([validatorName, valParams]) => {
        // if value false, means rule is switch off
        if (valParams === false || valParams === undefined || valParams === null)
            return;
        // Try to get validator function
        const validator = getValidator(validatorName);
        // If false, validator is not exist
        if (!validator)
            return;
        // Params can be object with more params
        // If value param exist get it if not, params is simple
        const validatorParam = valParams.value || valParams;
        // Try to get message from params
        const { message } = valParams;
        // Check if function required params
        // second argument is root model
        const res = validator(validatorParam, this);
        const rule = (typeof res === 'function') ? res : validator;
        // All required variant should be added as required param
        const validatorKey = validatorName.startsWith('required') ? 'required' : validatorName;
        fieldRules[validatorKey] = withParams({ fieldName, validatorParam, message }, rule);
        // Add validator legal age by default to field birthday
        if (validatorKey === 'birthday') {
            fieldRules.legalAge = withParams({ fieldName, validatorParam }, validators.legalAge(true));
            fieldRules.futureDate = withParams({ fieldName, validatorParam }, validators.futureDate(true));
        }
    });
    return fieldRules;
}
/**
 * Get validation rules for all fields by params from api
 * @param params
 */
export function getFieldsRulesByParams(params) {
    const rules = {};
    Object.entries(params).forEach(([fieldName, fieldParam]) => {
        const valParams = params[fieldName].validate;
        // pass model as context to get access to root model in custom validator
        if (valParams)
            rules[fieldName] = getSingleFieldRulesByParams.call(this, valParams, fieldName);
        // Setup nested rules if it exist
        if (fieldParam.schema) {
            // pass model as context to get access to root model in custom validator
            const nestedRules = getFieldsRulesByParams.call(this, fieldParam.schema);
            // Assign nested rules or set it
            if (rules[fieldName]) {
                Object.assign(rules[fieldName], nestedRules);
            }
            else {
                rules[fieldName] = nestedRules;
            }
        }
    });
    return rules;
}
/**
 * Get field error message by field validation results
 * @param valResult
 * @returns {string}
 */
export function getFieldErrorMessageByValidation(valResult) {
    if (!valResult || !valResult.$error)
        return '';
    const errors = [];
    Object.keys(valResult.$rules).forEach((ruleName) => {
        if (!valResult[ruleName]) {
            const ruleParams = valResult.$params[ruleName];
            if (ruleParams === null || ruleParams === void 0 ? void 0 : ruleParams.message) {
                errors.push(ruleParams.message);
            }
            else {
                // try to get validator name by params or as rule name
                const validatorName = ((ruleParams === null || ruleParams === void 0 ? void 0 : ruleParams.type) || ruleName);
                const messageFunc = errorMessages[validatorName] || errorMessages.universal;
                // Pass rule params and value
                errors.push(messageFunc((ruleParams || {}), valResult.$model));
            }
        }
    });
    return errors.join('. ');
}
export function getFieldRuleByServerResponse(fieldName, value, message) {
    const { notEql } = validators;
    const rule = notEql(value);
    return withParams({
        fieldName,
        value,
        message: upperFirst(message),
    }, rule);
}
//# sourceMappingURL=helpers.js.map