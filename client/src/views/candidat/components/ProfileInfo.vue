<template>
  <div>
    <label>{{label}}</label>
    <v-text-field
      :value="value"
      aria-readonly="true"
      readonly
      slot="activator"
    />
  </div>
</template>

<script>
export default {
  name: 'profile-info',
  props: {
    label: String,
    value: String,
  },
}
</script>
