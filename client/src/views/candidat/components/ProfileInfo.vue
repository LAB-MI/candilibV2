<template>
  <div>
    <v-chip label>
      {{label}}
    </v-chip>

    <p style="padding: 1em;">
      {{ value }}
    </p>

    <v-divider/>
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
