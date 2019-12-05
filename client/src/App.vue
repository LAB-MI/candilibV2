<template>
  <v-app>
    <v-content>
      <v-dialog
        v-model="authStatus"
        width="500"
        :hide-overlay="true"
      >
        <v-card>
          <v-card-title
            class="headline grey lighten-2"
            primary-title
          >
            Chargement en cours
          </v-card-title>

          <v-card-text>
            Vérification de l'authentification...
          </v-card-text>
        </v-card>
      </v-dialog>

      <router-view />
    </v-content>
    <app-evaluation />
    <app-snackbar />
  </v-app>
</template>

<script>
import { AppSnackbar, AppEvaluation } from '@/components'
import { CHECKING_AUTH_ADMIN, CHECKING_AUTH_CANDIDAT } from '@/store'

export default {
  components: {
    AppSnackbar,
    AppEvaluation,
  },

  data () {
    return {
      showDialog: this.authStatus,
    }
  },

  watch: {
    authStatus (isChecking) {
      this.showDialog = isChecking
    },
  },

  computed: {
    authStatus () {
      const isChecking = this.$store.state.auth.statusAdmin === CHECKING_AUTH_ADMIN ||
        this.$store.state.auth.statusCandidat === CHECKING_AUTH_CANDIDAT
      return isChecking
    },
  },

  mounted () {
    setTimeout(() => { this.showDialog = true })
  },
}
</script>
