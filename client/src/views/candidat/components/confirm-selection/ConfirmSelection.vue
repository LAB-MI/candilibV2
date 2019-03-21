<template>
  <div>
    <v-card-title v-if="isRecap && reservation.booked">
      <candidat-title title="Ma réservation" />
    </v-card-title>
    <v-card-title v-if="!isRecap">
      <section class="u-max-width">
        <header class="candidat-section-header">
          <h2 class="candidat-section-header__title" v-ripple @click="goToSelectTimeSlot">
            <v-btn icon>
              <v-icon>arrow_back_ios</v-icon>
            </v-btn>
            Confirmation
          </h2>
        </header>
      </section>
    </v-card-title>

    <div class="text--center">
      <h3 style="padding: 1em;">
        {{ candidat.me ? candidat.me.nomNaissance : '' }}
        {{ candidat.me ? candidat.me.prenom : '' }}
      </h3>

      <p>Vous avez choisi de passer l’épreuve pratique du permis à</p>

      <div v-if="!isRecap">
        <h1>
          <strong>
              {{ center.selected ? center.selected.nom : '' }}
          </strong>
        </h1>
        <p>
          <strong>
            {{ center.selected ? center.selected.adresse : '' }}
          </strong>
        </p>
        <p>
            Le
          <strong>
            {{ timeSlots.selected ? this.convertIsoDate(timeSlots.selected.slot) : '' }}
          </strong>
        </p>
      </div>
      <div v-else>
        <h1>
          <strong>
            {{ reservation.booked.centre ? reservation.booked.centre.nom : '' }}
          </strong>
        </h1>
        <p>
          <strong>
            {{ reservation.booked.centre ? reservation.booked.centre.adresse : '' }}
          </strong>
          <a
            target="_blank"
            @click.stop="true"
            class="location-icon"
            v-ripple
            :href="`https://www.openstreetmap.org/search?query=${reservation.booked.centre.adresse.replace(',', ' ').replace(/FR.*/, '')}`"
          >
            <v-icon>
              location_on
            </v-icon>
          </a>
        <p>
          <strong>
            Le
            {{ reservation.booked ? this.convertIsoDate(reservation.booked.date) : '' }}
          </strong>
        </p>
      </div>
    </div>
    <confirm-selection-step-two v-if="isRecap" />
    <confirm-selection-step-one v-else />
  </div>
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
    isRecap: {
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
      this.$router.push({ name: 'time-slot' })
    },

    goToSelectCenter () {
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
        this.$store.dispatch(SHOW_ERROR, error.message)
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
      if (!this.isRecap) {
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
    display: inline-block;
    margin-left: 0.5em;
    padding-left: 0.5em;
    border-left: 1px solid grey;
  }

  .redirectTextColor {
    color: blue;
  }
</style>
