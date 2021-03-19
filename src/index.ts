import ValidationLevel from './ValidationLevel';

export default function (rules: object, model: object): ValidationLevel {
    return new ValidationLevel(rules, model);
}

export { ValidationLevel };
