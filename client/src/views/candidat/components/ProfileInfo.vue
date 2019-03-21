<template>
  <div>
    <label>{{label}}</label>
    <v-tooltip bottom>
      <v-text-field
        :value="value"
        aria-readonly="true"
        aria-disabled="true"
        readonly
        disabled
        slot="activator"
      />
      <span>{{value}}</span>
    </v-tooltip>
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
