import Vue from 'vue';
import merge from 'lodash.merge';
import { isObject } from './utils';
import * as helpers from './helpers';

export default class ValidationLevel {
  constructor({ rules = {}, model, parent, ownKey }) {
    this.$setAll({
      _dirty: false,
      $params: {},
      $rules: rules,
      _parent: parent,
      _ownKey: ownKey,
      _model: model,
    });
    this._setValidations();
  }

  get _keys() {
    return Object.keys(this.$rules);
  }

  get _nestedKeys() {
    return this._keys.filter(k => this._getIsKeyNested(k));
  }

  get _ruleKeys() {
    return this._keys.filter(k => !this._getIsKeyNested(k));
  }

  get $dirty() {
    return Boolean(this._dirty || (this._nestedKeys.length && this._nestedKeys.every(k => this[k].$dirty)));
  }

  get $invalid() {
    return this._ruleKeys.some(k => !this[k])
    || this._nestedKeys.some(k => this[k].$invalid);
  }

  get $error() {
    return this.$dirty && this.$invalid;
  }

  get $parentModel() {
    return this._parent ? this._parent.$model : null;
  }

  get $model() {
    return this.$parentModel ? this.$parentModel[this._ownKey] : this._model;
  }

  $set(name, value, model = this) {
    Vue.set(model, name, value);
  }

  $setAll(data, model = this) {
    if (!data || typeof data !== 'object') return;
    Object.entries(data)
      .forEach(([key, value]) => {
        // If value is object and model exist as object too
        if (isObject(value) && isObject(model[key])) {
          // Call recursive to not lost observe set by field params in object
          this.$setAll(value, model[key]);
        } else {
          this.$set(key, value, model);
        }
      });
  }

  _setDirty(isDirty) {
    this.$set('_dirty', isDirty);
    this._nestedKeys.forEach((k) => {
      this[k]._setDirty(isDirty);
    });
  }

  _getIsKeyNested(key) {
    return typeof this.$rules[key] !== 'function';
  }

  _setValidations() {
    this._setNested();
    this._setRules();
  }

  _setNested() {
    this._nestedKeys.forEach((k) => {
      if (this[k]) {
        this[k].$addRules(this.$rules[k]);
      } else {
        this[k] = new ValidationLevel({
          rules: this.$rules[k],
          parent: this,
          ownKey: k,
        });
      }
    });
  }

  _setRules() {
    this._ruleKeys.forEach((k) => {
      if (this[k] !== undefined) return;
      let validator = this.$rules[k];
      if (validator.name === helpers.withParamsFuncName) {
        const { $params, $validator } = validator();
        this.$params[k] = $params;
        validator = $validator;
      }
      Object.defineProperty(this, k, {
        get: () => validator.call(this, this.$model, (this.$parentModel || this.$model)),
        enumerable: true,
      });
    });
  }

  $touch() {
    this._setDirty(true);
  }

  $reset() {
    this._setDirty(false);
  }

  $addRules(rules) {
    this.$setAll({ $rules: merge(this.$rules, rules) });
    this._setValidations();
  }
}
