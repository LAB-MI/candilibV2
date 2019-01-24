<template>
  <div class="candidat">
    <v-container :style="{ maxWidth: '100vw', paddingLeft: 0, paddingRight: 0 }">
      <candidat-header :header-icons="headerIcons" />
      <div :style="{margin: '4em 0 0 0'}">
        {{ /* TODO: Espace candidat */ }}
      </div>
    </v-container>
  </div>
</template>

<script>
import { CHECK_TOKEN, SIGNED_IN } from '@/store'
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
      await this.$store.dispatch(CHECK_TOKEN)
      if (this.authStatus !== SIGNED_IN) {
        this.$router.push({ name: 'candidat-login', query: { nextPath: this.$route.fullPath } })
      }
    },

  },

  mounted () {
    this.checkAuth()
  },
}
</script>
