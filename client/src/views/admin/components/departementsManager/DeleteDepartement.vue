<template>
  <v-dialog
    v-model="deleting"
    width="500"
  >
    <template v-slot:activator="{ on }">
      <v-btn
        slot="activator"
        :class="`t-btn-delete-${departementId}`"
        color="#DC143C"
        icon
        v-on="on"
      >
        <v-icon>delete</v-icon>
      </v-btn>
    </template>

    <v-card>
      <v-card-title
        class="headline red darken-1 white--text"
        primary-title
      >
        Suppression du département {{ departementId }}
      </v-card-title>

      <v-card-text>
        Voulez-vous vraiment supprimer ce département <strong>{{ departementId }}</strong> ?
        Cette action est irréversible.
      </v-card-text>

      <v-card-text>
        Afin de confirmer votre action saisissez le numéro du département <strong>{{ departementId }}</strong> dans la zone de texte suivante puis confirmer.
      </v-card-text>
      <v-divider />

      <v-text-field
        v-model="confirmString"
        class="pa-3 t-input-confirm-id"
        label="département"
        outlined
        color="error"
      />

      <v-card-actions right>
        <v-spacer />
        <v-btn
          class="t-btn-cancel-delete"
          color="info"
          tabindex="0"
          outlined
          @click="deleting = false"
        >
          Annuler
        </v-btn>
        <v-btn
          class="t-btn-delete-confirm"
          color="error"
          tabindex="0"
          :disabled="!isStringConfirm"
          @click="deleteDepartement"
        >
          Oui, supprimer
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import {
  DELETE_DEPARTEMENT_REQUEST,
} from '@/store'
export default {
  props: {
    departementId: {
      type: String,
      default: '',
    },
  },

  data () {
    return {
      deleting: false,
      confirmString: '',
      isStringConfirm: false,
    }
  },

  watch: {
    confirmString (newValue) {
      this.verifyStringConfimation()
    },
  },
  methods: {
    async deleteDepartement () {
      await this.$store.dispatch(DELETE_DEPARTEMENT_REQUEST, this.departementId)
      this.deleting = false
    },

    verifyStringConfimation () {
      if (this.confirmString.trim() === this.departementId) {
        this.isStringConfirm = true
        return
      }
      this.isStringConfirm = false
    },
  },
}
</script>
