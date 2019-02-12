<template>
  <v-app>
    <v-content>
      <v-dialog
        v-model="authStatus"
        width="500"
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
    <app-snackbar />
  </v-app>
</template>

<script>
import { AppSnackbar } from '@/components'
import { CHECKING_AUTH_ADMIN, CHECKING_AUTH_CANDIDAT } from '@/store'

export default {
  components: {
    AppSnackbar,
  },
  computed: {
    authStatus: {
      get () {
        const isChecking = this.$store.state.auth.statusAdmin === CHECKING_AUTH_ADMIN ||
          this.$store.state.auth.statusCandidat === CHECKING_AUTH_CANDIDAT
        return isChecking
      },
      set (value) {

      },
    },
  },
}
</script>
