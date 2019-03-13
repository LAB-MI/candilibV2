<template>
  <div>
    <v-card>
      <div class="text--center">
        <h3 style="padding: 1em;">
          Madame, Monsieur
          {{ candidat ? candidat.nomNaissance : '' }}
          {{ candidat ? candidat.prenom : '' }}
        </h3>
        <p>
          Vous avez choisi de passer l’épreuve pratique du permis à
        </p>
        <p>
          <strong>
            <h1>{{ reservation ? reservation.centre.nom : '' }}</h1>
          </strong>
        </p>
        <p>
          <strong>{{ reservation ? reservation.centre.adresse : '' }}</strong>
        </p>
        <div class="location-icon">
          <a
            target="_blank"
            class="u-flex"
            @click.stop="true"
            v-ripple
            :href="`https://www.openstreetmap.org/search?query=${reservation.centre.adresse.replace(',', ' ').replace(/FR.*/, '')}`"
          >
            <v-icon>
              location_on
            </v-icon>
          </a>
        </div>
        <p>
          <strong>Le &nbsp;</strong>
          <strong>{{ reservation ? this.convertIsoDate(reservation.date) : '' }}</strong>
        </p>
        <router-link :to="{name: 'selection-centre'}">
          <v-btn color="primary">
            Modification
            &nbsp;
            <v-icon>
              edit
            </v-icon>
        </v-btn>
        </router-link>
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
      </div>
    </v-card>
  </div>
</template>

<script>
import { DateTime } from 'luxon'

import {
  DELETE_CANDIDAT_RESERVATION_REQUEST,
  SHOW_ERROR,
  SHOW_SUCCESS,
} from '@/store'

export default {
  props: {
    reservation: {
      type: Object,
      default: undefined,
    },
    candidat: {
      type: Object,
      default: undefined,
    },
  },

  data () {
    return {
      dialog: false,
    }
  },

  methods: {
    convertIsoDate (dateIso) {
      return `${DateTime.fromISO(dateIso).toLocaleString({
        weekday: 'long',
        month: 'long',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })}`
    },

    async deleteConfirm () {
      try {
        await this.$store.dispatch(DELETE_CANDIDAT_RESERVATION_REQUEST)
        this.dialog = false
        this.$store.dispatch(SHOW_SUCCESS, 'La reservation a bien ete supprimer')
        // this.$router.go()
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

  .location-icon {
    margin-bottom: 15px;
    margin-left: calc(95% / 2);
  }
</style>
