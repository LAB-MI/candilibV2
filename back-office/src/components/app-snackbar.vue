<template>
  <v-snackbar
    :value="val"
    bottom
    :timeout="timeout"
  >
    {{ message }}
    <v-btn icon
      flat
      @click="close"
    >
      <v-icon color="pink">
        close
      </v-icon>
    </v-btn>
  </v-snackbar>
</template>

<script>
export default {
  props: {
    timeout: Number,
    snackbar: Boolean,
    message: String,
    onClose: Function,
  },

  data () {
    return {
      val: this.snackbar,
    }
  },

  methods: {
    close () {
      this.onClose()
    },
  },
}
</script>
