<template>
  <div>
    <candidat v-if="signedIn" />
    <signup v-else />
  </div>
</template>

<script>
// @ is an alias to /src
import { Signup } from './candidat/components'
import Candidat from './candidat'
import { CHECK_CANDIDAT_TOKEN, SIGNED_IN_AS_CANDIDAT } from '@/store'

export default {
  name: 'candidat-home',
  data () {
    return {
      SIGNED_IN_AS_CANDIDAT
    }
  },
  components: {
    Signup,
    Candidat,
  },
  computed: {
    signedIn () {
      return this.$store.state.auth.status === SIGNED_IN_AS_CANDIDAT
    },
  },
  methods: {
    async checkAuth () {
      await this.$store.dispatch(CHECK_CANDIDAT_TOKEN, this.$route.query.token)
      if (this.authStatus !== SIGNED_IN_AS_CANDIDAT) {
        this.$router.push({ name: 'candidat-signup', query: { nextPath: this.$route.fullPath } })
      }

      if (this.authStatus === SIGNED_IN_AS_CANDIDAT) {
        this.$router.push(this.$route.query.nextPath || { name: 'candidat' })
      }
    },
  },
  mounted () {
    this.checkAuth()
  },
}
</script>
