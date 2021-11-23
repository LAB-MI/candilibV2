<template>
  <v-dialog
    v-model="deleting"
    width="500"
  >
    <template v-slot:activator="{ on }">
      <v-btn
        slot="activator"
        class="t-btn-delete"
        color="#DC143C"
        icon
        v-on="on"
      >
        <v-icon>delete</v-icon>
      </v-btn>
    </template>

    <v-card>
      <v-card-title
        class="headline grey lighten-2"
        primary-title
      >
        Suppression de {{ email }}
      </v-card-title>

      <v-card-text class="confirmation-text">
        Voulez-vous vraiment archiver cet utilisateur <strong>{{ email }}</strong> ?
        Cette action est irréversible
      </v-card-text>

      <v-divider />

      <v-card-actions right>
        <v-spacer />
        <v-btn
          class="t-btn-cancel-delete"
          color="#CD1338"
          tabindex="0"
          outlined
          @click="deleting = false"
        >
          Annuler
        </v-btn>
        <v-btn
          class="t-btn-delete-confirm"
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
import {
  DELETE_USER_REQUEST,
  SHOW_SUCCESS,
  SHOW_ERROR,
  FETCH_USER_LIST_REQUEST,
  FETCH_ARCHIVED_USER_LIST_REQUEST,
} from '@/store'
export default {
  props: {
    email: {
      type: String,
      default: 'user@example.com',
    },
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
        this.$store.dispatch(SHOW_SUCCESS, 'L\'utilisateur a bien été archivé')
        this.$store.dispatch(FETCH_USER_LIST_REQUEST)
        this.$store.dispatch(FETCH_ARCHIVED_USER_LIST_REQUEST)
      } catch (error) {
        this.$store.dispatch(SHOW_ERROR, error.message)
      }
      this.deleting = false
    },
  },
}
</script>

<style lang="stylus" scoped>
.confirmation-text {
  font-size: 1.3em;
}
</style>
