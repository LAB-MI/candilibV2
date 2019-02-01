<template>
  <div>
    <label>{{label}}</label>
    <v-tooltip bottom>
      <v-text-field
        :value="value"
        aria-readonly="true"
        readonly
        aria-disabled="true"
        disabled
        slot="activator"
      />
      <span>{{value}}</span>
    </v-tooltip>
  </div>
</template>

<script>
export default {
  props: {
    label: String,
    value: String,
  },
}
</script>
