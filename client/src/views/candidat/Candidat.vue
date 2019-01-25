<template>
  <div class="candidat">
    <v-container :style="{ maxWidth: '100vw', paddingLeft: 0, paddingRight: 0 }">
      <candidat-header :header-icons="headerIcons" />
      <div :style="{margin: '4em 0 0 0'}">
        {{ /* TODO: Espace candidat */ }}
        // TODO: Espace candidat
      </div>
    </v-container>
  </div>
</template>

<script>
import { CHECK_CANDIDAT_TOKEN, SIGNED_IN_AS_CANDIDAT } from '@/store'
import CandidatHeader from './components/CandidatHeader'

export default {
  components: {
    CandidatHeader,
  },

  data () {
    return {
      headerIcons: [],
    }
  },
  computed: {
    authStatus () {
      return this.$store.state.auth.status
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
