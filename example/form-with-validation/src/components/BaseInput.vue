<template>
<div class="BaseInput input-group">
  <label :class="{ row }">
    <span class="label-text">{{label}}</span>
    <input
      v-if="!$slots.default"
      :value="value"
      @input="onInput"
      v-bind="$attrs"
    />
    <slot/>
  </label>
  <span
    class="error-message"
    v-if="error"
  >
    {{error}}
  </span>
</div>
</template>

<script>
export default {
  name: 'BaseInput',
  props: {
    label: String,
    value: String,
    error: [String, Boolean],
    row: Boolean,
  },
  methods: {
    onInput(e) {
      this.$emit('input', e.target.value);
    }
  },
};
</script>

<style scoped>
  .input-group {
    display: flex;
    flex-direction: column;
    padding-bottom: 18px;
    position: relative;
  }
  label {
    display: flex;
    flex-direction: column;
  }
  label.row {
    flex-direction: row;
  }
  .label-text {
    text-align: left;
    font-weight: bold;
  }
  .error-message {
    font-size: .8em;
    color: red;
    position: absolute;
    bottom: 0;
  }
</style>
