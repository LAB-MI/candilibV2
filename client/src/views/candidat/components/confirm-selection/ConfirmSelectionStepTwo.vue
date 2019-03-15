<template>
<div>
  <h4>
    Votre réservation est confirmée
    &nbsp;
    <v-icon color="success">
      check
    </v-icon>
  </h4>
  <h4>
    Un email de confirmation vous a été envoyé à l'adresse
    <span color="primary">{{ candidat ? candidat.email : '' }}</span>
    &nbsp;
    <v-icon color="success">
      check
    </v-icon>
  </h4>
  <v-dialog v-model="dialog" persistent max-width="290">
    <template v-slot:activator="{ on }">
      <v-btn color="#f82249" dark v-on="on">
        Annulation
        &nbsp;
        <v-icon>
          delete_forever
        </v-icon>
      </v-btn>
    </template>
    <v-card>
      <v-card-title class="headline">
        Confirm Suppr
      </v-card-title>
      <v-card-text>
        Bla bla bla fait attention suppresion
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="red darken-1" flat @click="dialog = false">Retour</v-btn>
        <v-btn color="success darken-1" flat @click="deleteConfirm()">Comfirm</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <router-link :to="{ name: 'selection-centre' }">
    <v-btn color="primary">
      Modification
      &nbsp;
      <v-icon>
        edit
      </v-icon>
    </v-btn>
  </router-link>
  <v-btn color="success">
      Renvoyer l'email de comfirmation
      &nbsp;
      <v-icon>
        edit
      </v-icon>
  </v-btn>
</div>
</template>

<script>
import { mapState } from 'vuex'
import {
  DELETE_CANDIDAT_RESERVATION_REQUEST,
  SHOW_ERROR,
} from '@/store'

export default {
  data () {
    return {
      selectedCheckBox: [],
      dialog: false,
    }
  },

  computed: {
    ...mapState(['center', 'timeSlots', 'candidat', 'reservation']),
    disabled () {
      return this.selectedCheckBox.length !== 2
    },
  },

  methods: {
    async deleteConfirm () {
      try {
        await this.$store.dispatch(DELETE_CANDIDAT_RESERVATION_REQUEST)
        this.dialog = false
      } catch (error) {
        this.$store.dispatch(SHOW_ERROR, error.message)
      }
    },
  },
}
</script>

<style lang="postcss" scoped>
  h4 {
    padding-bottom: 2em;
    text-transform: uppercase;
  }
  .redirectTextColor {
    color: blue;
  }
</style>
