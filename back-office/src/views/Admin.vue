<template>
  <div class="admin">
    <h1>This is the admin page</h1>
  </div>
</template>

<script>
import { CHECK_TOKEN, SIGNED_IN } from '@/store'

export default {
  computed: {
    authStatus () {
      return this.$store.state.auth.status
    },
  },
  methods: {
    async checkAuth () {
      await this.$store.dispatch(CHECK_TOKEN)
      if (this.authStatus !== SIGNED_IN) {
        this.$router.push(`/?nextPath=${this.$route.fullPath}&from=App`)
      }
    },
  },
  mounted () {
    this.checkAuth()
  },
}
</script>
