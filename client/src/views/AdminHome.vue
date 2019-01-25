<template>
  <Login />
</template>

<script>
// @ is an alias to /src
import Login from './admin/components/Login.vue'
import { CHECK_ADMIN_TOKEN, SIGNED_IN_AS_ADMIN } from '@/store'

export default {
  name: 'admin-home',
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
      await this.$store.dispatch(CHECK_ADMIN_TOKEN)
      if (this.authStatus === SIGNED_IN_AS_ADMIN) {
        this.$router.push(this.$route.query.nextPath || { name: 'admin' })
      }
    },
  },
  mounted () {
    this.checkAuth()
  },
}
</script>
