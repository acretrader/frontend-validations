<template>
  <div id="app">
    <form>
      <BaseInput
        v-model="model.firstName"
        label="First Name"
        :error="getErrorMessage('firstName')"
      />
      <BaseInput
        v-model="model.lastName"
        label="Last Name"
        :error="getErrorMessage('lastName')"
      />
      <BaseInput
        v-model="model.address.city"
        label="City (New York, London, Moscow are in blacklist) "
        :error="getErrorMessage('address.city')"
      />
      <BaseInput
        label="Homeless"
        row
      >
        <input
          type="checkbox"
          v-model="homeless"
        />
      </BaseInput>
      <BaseInput
        v-model="model.address.street"
        label="Street"
        :error="getErrorMessage('address.street')"
        :disabled="homeless"
      />
      <button
        class="button"
        type="submit"
        @click.prevent="send"
      >Send</button>
    </form>
  </div>
</template>

<script>
import get from 'lodash.get';
import validations from '../../../dist';
import { validators, helpers } from '../../../dist';
import BaseInput from './components/BaseInput';

export default {
  name: 'App',
  components: {
    BaseInput,
  },
  data() {
    return {
      homeless: false,
      model: {
        firstName: '',
        lastName: '',
        address: {
          city: '',
          street: '',
        }
      }
    };
  },
  created() {
    const validationRules = {
      firstName: {
        // Built it validator generator
        required: validators.required(),
        // some custom validator
        minLength: helpers.withParams(
            { message: 'Too short. Minimum is 4 characters' },
            (value) => value && value.length > 4
        )

      },
      lastName: {
        required: validators.required(),
        // Some custom validator with params
        someValidation: helpers.withParams(
            { message: 'Some custom error message' },
            // If field has required validator, first check if field is not empty
            (value) => (!helpers.req(value) || value && value.length > 4),
        )
      },
      // nested fields
      address: {
        city: {
          required: validators.required(),
          // One more custom validator
          allowedCity: helpers.withParams(
            { message: 'This city is not allowed' },
            value => {console.log(value); return !helpers.req(value) || !['New York', 'London', 'Moscow'].includes(value)},
          ),
        },
        street: {
          // Validation related on component data
          // Arrow function is import to bind 'this'
          required: (value) => {
            if (this.homeless) return true;
            return helpers.req(value);
          },
        }
      },
    };
    this.$set(this.model, '$v', validations(validationRules, this.model));
  },
  methods: {
    send() {
      this.model.$v.$touch();
      if (this.model.$v.$error) return;
      alert('Successfully Sent')
    },
    getErrorMessage(fieldName) {
      const validationResult = get(this.model.$v, fieldName);
      if (!validationResult) return false;
      return helpers.getFieldErrorMessageByValidation(validationResult);
    },
  },
}
</script>

<style>
#app {
  max-width: 450px;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

</style>
