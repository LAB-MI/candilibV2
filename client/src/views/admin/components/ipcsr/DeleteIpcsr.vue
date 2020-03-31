<template>
  <v-dialog
    v-model="deleting"
    width="800"
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
        Suppression de {{ prenom }} {{ nom }} ({{ matricule }})
      </v-card-title>

      <v-card-text>
        Voulez-vous vraiment archiver cet IPCSR <strong>{{ prenom }} {{ nom }}</strong> ?
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
          @click="deleteUser"
        >
          Oui, supprimer
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import {
  SHOW_SUCCESS,
  SHOW_ERROR,
  DELETE_IPCSR_REQUEST,
  FETCH_IPCSR_LIST_REQUEST,
} from '@/store'

export default {
  props: {
    ipcsrId: {
      type: String,
      default: 'ipcsrId',
    },
    matricule: {
      type: String,
      default: '',
    },
    nom: {
      type: String,
      default: '[Nom]',
    },
    prenom: {
      type: String,
      default: '[Prenom]',
    },
  },

  data () {
    return {
      deleting: false,
    }
  },

  methods: {
    async deleteUser () {
      try {
        await this.$store.dispatch(DELETE_IPCSR_REQUEST, this.ipcsrId)
        this.$store.dispatch(SHOW_SUCCESS, 'L\'IPCSR a bien été archivé·e')
        this.$store.dispatch(FETCH_IPCSR_LIST_REQUEST)
      } catch (error) {
        this.$store.dispatch(SHOW_ERROR, error.message)
      }
      this.deleting = false
    },
  },
}
</script>
