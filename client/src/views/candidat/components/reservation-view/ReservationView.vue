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
        <!-- <p>
        </p> -->
        <p>
          <strong>Le &nbsp;</strong>
          <strong>{{ reservation ? this.convertIsoDate(reservation.date) : '' }}</strong>
        </p>
        <v-card-action>
          <router-link :to="{name: 'selection-centre'}">
          <v-btn color="primary">
            Modification
            &nbsp;
            <v-icon>edit</v-icon>
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
                <v-btn color="success darken-1" flat @click="dialog = false">Comfirm</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-card-action>
      </div>
    </v-card>
  </div>
</template>

<script>
import { DateTime } from 'luxon'
import { mapState } from 'vuex'

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
      dialog1: false,
    }
  },

  computed: {
    ...mapState(['candidat']),
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

  .location-icon {
    margin-bottom: 15px;
    margin-left: calc(95% / 2);
  }
</style>
