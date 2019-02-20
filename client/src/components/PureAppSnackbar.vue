<template>
  <v-snackbar
    :value="message.show"
    :color="message.color"
    bottom
    :timeout="message.timeout"
    @input="onClose"
  >
    {{ message.content }}
    <v-btn icon
      flat
      @click="onClose"
    >
      <v-icon color="white">
        close
      </v-icon>
    </v-btn>
  </v-snackbar>
</template>

<script>
export default {
  props: {
    message: Object,
  },
}
</script>
