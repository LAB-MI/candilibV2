<template>
  <v-snackbar
    :value="message.show"
    :color="message.color"
    bottom
    multi-line
    :timeout="message.timeout"
    @input="onClose"
  >
    {{ message.content }}
    <v-btn
      icon
      text
      @click="onClose"
    >
      <v-icon color="white">
        close
      </v-icon>
    </v-btn>
  </v-snackbar>
</template>

<script>
import { mapState } from 'vuex'
import { HIDE_MESSAGE } from '@/store'

export default {
  computed: {
    ...mapState([
      'message',
    ]),
  },

  methods: {
    onClose () {
      this.$store.dispatch(HIDE_MESSAGE)
    },
  },
}
</script>
