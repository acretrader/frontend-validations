import ValidationLevel from './ValidationLevel';
import * as helpers from './helpers';
import * as validators from './validators';
export default function (rules, model) {
    return new ValidationLevel(rules, model);
}
export { ValidationLevel, helpers, validators };
//# sourceMappingURL=index.js.map