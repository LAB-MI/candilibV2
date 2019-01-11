<template>
  <Login />
</template>

<script>
// @ is an alias to /src
import Login from '@/components/Login.vue'
import { CHECK_TOKEN, SIGNED_IN } from '@/store'

export default {
  name: 'home',
  components: {
    Login,
  },
  computed: {
    authStatus () {
      return this.$store.state.auth.status
    },
  },
  methods: {
    async checkAuth () {
      await this.$store.dispatch(CHECK_TOKEN)
      console.log('nextPath', this.$route.query.nextPath)
      if (this.authStatus === SIGNED_IN) {
        this.$router.push(this.$route.query.nextPath || '/admin')
      }
    },
  },
  mounted () {
    this.checkAuth()
  },
}
</script>
