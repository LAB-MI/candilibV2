<template>
  <div>
    <v-card>
      <div class="text--center">
        <h3 style="padding: 1em;">
          Madame, Monsieur
          <!-- {{ candidat.me ? candidat.me.nomNaissance : '' }}
          {{ candidat.me ? candidat.me.prenom : '' }} -->
        </h3>
        <p>
          Vous avez choisi de passer l’épreuve pratique du permis à
        </p>
        <p>
          <strong>
            <!-- <h1>{{ center.selected ? center.selected.nom : '' }}</h1> -->
          </strong>
        </p>
        <p>
          <!-- <strong>{{ center.selected ? center.selected.adresse : '' }}</strong> -->
          <a
          target="_blank"
          class="location-icon  u-flex"
          @click.stop="true"
          v-ripple
        >
          <!-- :href="`https://www.openstreetmap.org/search?query=${center.centre.adresse.replace(',', ' ').replace(/FR.*/, '')}`" -->
          <v-icon>
            location_on
          </v-icon>
        </a>
        </p>
        <p>
          <strong>Le</strong>
        </p>
        <p>
          <!-- <strong>{{ timeSlots.selected ? this.convertIsoDate(timeSlots.selected.slot) : '' }}</strong> -->
        </p>
        <v-card-action>
          <v-dialog v-model="dialog" persistent max-width="290">
            <template v-slot:activator="{ on }">
              <v-btn color="primary" dark v-on="on">
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
                <v-btn color="success darken-1" flat @click="dialog = false">Comfirm</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <router-link :to="{name: 'selection-centre'}">
          <v-btn>
            Modification
            &nbsp;
            <v-icon>edit</v-icon>
          </v-btn>
          </router-link>
        </v-card-action>
      </div>
    </v-card>
  </div>
</template>

<script>
import { DateTime } from 'luxon'
import { mapState } from 'vuex'

// import {
//   FETCH_CANDIDAT_RESERVATION_REQUEST,
// } from '@/store'

export default {
  data () {
    return {
      dialog: false,
      dialog1: false,
    }
  },

  computed: {
    ...mapState(['center', 'timeSlots', 'candidat']),
    // disabled () {
    //   return this.selectedCheckBox.length !== 2
    // },
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

    // async getCandidatReservation () {
    //   try {
    //     await this.$store.dispatch(FETCH_CANDIDAT_RESERVATION_REQUEST)
    //   } catch (error) {
    //     await this.$store.dispatch(SHOW_ERROR, error.message)
    //   }
    // },
  },

  mounted () {
    // this.getCandidatReservation()
    // this.getSelectedCenterAndDate()
  },
}
</script>

<style lang="postcss" scoped>
  h4 {
    padding-bottom: 2em;
    text-transform: uppercase;
  }
</style>
