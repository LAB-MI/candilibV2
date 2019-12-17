<template>
  <div>
    <v-chip label>
      {{ label }}
    </v-chip>
    <p style="padding: 1em;">
      {{ value }}
    </p>
    <v-divider />
  </div>
</template>

<script>
export default {
  name: 'ProfileInfo',
  props: {
    label: {
      type: String,
      default: '',
    },
    value: {
      type: String,
      default: '',
    },
  },
}
</script>
