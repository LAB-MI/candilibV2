<template>
  <v-dialog
    v-model="deleting"
    width="500"
  >
    <template v-slot:activator="{ on }">
      <v-btn
        class="reset-password-btn"
        slot="activator"
        color="#DC143C"
        v-on="on"
        icon
      >
      <v-icon>cancel</v-icon>
      </v-btn>
    </template>

    <v-card>
      <v-card-title
        class="headline grey lighten-2"
        primary-title
      >
        Suppression de <strong>{{ email }}</strong>
      </v-card-title>

      <v-card-text>
        Voulez-vous vraiment archiver cet utilisateur <strong>{{ email }}</strong> ?
        Cette action est irréversible
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions right>
        <v-spacer></v-spacer>
        <v-btn
          color="#CD1338"
          icon
          @click="deleting = false"
        >
        <v-icon>cancel</v-icon>
        </v-btn>
        <v-btn
          color="primary"
          @click="archiveUser"
        >
          Oui, supprimer
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { DELETE_USER_REQUEST, SHOW_SUCCESS, SHOW_ERROR, FETCH_USER_LIST_REQUEST } from '../../../../store'
export default {
  props: {
    email: String,
  },

  data () {
    return {
      deleting: false,
    }
  },

  methods: {
    async archiveUser () {
      try {
        await this.$store.dispatch(DELETE_USER_REQUEST, this.email)
        this.$store.dispatch(SHOW_SUCCESS, `L'utilisateur à bien été archivé.`)
        this.$store.dispatch(FETCH_USER_LIST_REQUEST)
      } catch (error) {
        this.$store.dispatch(SHOW_ERROR, error.message)
      }
      this.deleting = false
    },
  },
}
</script>
