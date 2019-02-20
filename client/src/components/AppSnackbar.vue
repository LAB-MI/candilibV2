<template>
  <pure-app-snackbar :message="message" />
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
