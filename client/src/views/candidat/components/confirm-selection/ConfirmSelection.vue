<template>
    <v-container>
      <v-card class="text--center" >
        <section>
          <header class="candidat-section-header"  v-if="!flagRecap">
            <h2 class="candidat-section-header__title" v-ripple @click="goToSelectTimeSlot">
              <v-btn icon>
                <v-icon>arrow_back_ios</v-icon>
              </v-btn>
              Confirmation
            </h2>
          </header>
        </section>
        <div class="text--center">
          <h3 style="padding: 1em;">
            Madame, Monsieur
            {{ candidat.me ? candidat.me.nomNaissance : '' }}
            {{ candidat.me ? candidat.me.prenom : '' }}
          </h3>
          <p>Vous avez choisi de passer l’épreuve pratique du permis à</p>
          <div v-if="!flagRecap">
            <p>
              <strong>
                <h1>{{ center.selected ? center.selected.nom : '' }}</h1>
              </strong>
            </p>
            <p>
              <strong>{{ center.selected ? center.selected.adresse : '' }}</strong>
            </p>
            <p>
              <strong>Le</strong>
            </p>
            <p>
              <strong>{{ timeSlots.selected ? this.convertIsoDate(timeSlots.selected.slot) : '' }}</strong>
            </p>
          </div>
          <div v-else>
            <p>
              <strong>
                <h1>{{ reservation.booked.centre ? reservation.booked.centre.nom : '' }}</h1>
              </strong>
            </p>
            <p>
              <strong>{{ reservation.booked.centre ? reservation.booked.centre.adresse : '' }}</strong>
            </p>
            <div class="location-icon">
            <a
              target="_blank"
              class="u-flex"
              @click.stop="true"
              v-ripple
              :href="`https://www.openstreetmap.org/search?query=${reservation.booked.centre.adresse.replace(',', ' ').replace(/FR.*/, '')}`"
            >
              <v-icon>
              location_on
              </v-icon>
            </a>
            </div>
            <p>
              <strong>Le</strong>
            </p>
            <p>
              <strong>{{ reservation.booked ? this.convertIsoDate(reservation.booked.date) : '' }}</strong>
            </p>
          </div>
        </div>
        <div v-if="flagRecap">
          <confirm-selection-step-two />
        </div>
        <div v-else>
          <confirm-selection-step-one />
        </div>
      </v-card>
    </v-container>
</template>

<script>
import { DateTime } from 'luxon'
import { mapState } from 'vuex'

import {
  CONFIRM_SELECT_DAY_REQUEST,
  DELETE_CANDIDAT_RESERVATION_REQUEST,
  FETCH_CANDIDAT_RESERVATION_REQUEST,
  FETCH_CENTER_REQUEST,
  SELECT_DAY,
  SHOW_ERROR,
  SHOW_SUCCESS,
} from '@/store'

import ConfirmSelectionStepOne from './ConfirmSelectionStepOne.vue'
import ConfirmSelectionStepTwo from './ConfirmSelectionStepTwo.vue'

export default {
  components: {
    ConfirmSelectionStepOne,
    ConfirmSelectionStepTwo,
  },

  data () {
    return {
      selectedCheckBox: [],
    }
  },

  props: {
    flagRecap: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    ...mapState(['center', 'timeSlots', 'candidat', 'reservation']),
    disabled () {
      return this.selectedCheckBox.length !== 2
    },
  },

  methods: {
    goToSelectTimeSlot () {
      // this.$router.back()
      this.$router.push({ name: 'time-slot' })
    },

    goToSelectCenter () {
      // this.$router.back()
      this.$router.push({ name: 'selection-centre' })
    },

    goToHome () {
      this.$router.push({ name: 'candidat-home' })
    },

    async deleteConfirm () {
      try {
        await this.$store.dispatch(DELETE_CANDIDAT_RESERVATION_REQUEST)
        this.dialog = false
        this.$store.dispatch(SHOW_SUCCESS, 'La reservation a bien ete supprimer')
      } catch (error) {
        this.$store.dispatch(SHOW_ERROR, error.message)
      }
    },

    async getCandidatReservation () {
      try {
        await this.$store.dispatch(FETCH_CANDIDAT_RESERVATION_REQUEST)
      } catch (error) {

      }
    },
    async confirmReservation () {
      const selected = {
        ...this.timeSlots.selected,
        isAccompanied: true,
        hasDualControlCar: true,
      }
      try {
        await this.$store.dispatch(CONFIRM_SELECT_DAY_REQUEST, selected)
      } catch (error) {
        await this.$store.dispatch(SHOW_ERROR, error.message)
      }
    },

    convertIsoDate (dateIso) {
      return `${DateTime.fromISO(dateIso).toLocaleString({
        weekday: 'long',
        month: 'long',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })}`
    },

    async getSelectedCenterAndDate () {
      const {
        center: nom,
        departement,
        slot,
      } = this.$route.params
      const selected = this.center.selected
      if (!this.flagRecap) {
        if (!selected || !selected._id) {
          await this.$store.dispatch(FETCH_CENTER_REQUEST, { departement, nom })
          setTimeout(this.getSelectedCenterAndDate, 100)
          return
        }

        const selectedSlot = {
          slot,
          centre: {
            id: selected._id,
            nom,
            departement,
          },
        }
        this.$store.dispatch(SELECT_DAY, selectedSlot)
      }
    },
  },

  async mounted () {
    await this.getCandidatReservation()
    await this.getSelectedCenterAndDate()
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

  .redirectTextColor {
    color: blue;
  }
</style>
