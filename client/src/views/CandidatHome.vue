<template>
  <signup />
</template>

<script>
// @ is an alias to /src
import Signup from './candidat/components/Signup.vue'
import { CHECK_TOKEN, SIGNED_IN } from '@/store'

export default {
  name: 'candidat-home',
  components: {
    Signup,
  },
  computed: {
    authStatus () {
      return this.$store.state.auth.status
    },
  },
  methods: {
    async checkAuth () {
      await this.$store.dispatch(CHECK_TOKEN)
      if (this.authStatus === SIGNED_IN) {
        this.$router.push(this.$route.query.nextPath || { name: 'candidat' })
      }
    },
  },
  mounted () {
    this.checkAuth()
  },
}
</script>
