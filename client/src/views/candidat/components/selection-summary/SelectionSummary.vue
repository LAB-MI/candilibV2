<template>
  <v-card class="text--center">
    <page-title :title="title" />
    <div class="text--center">
      <p>{{ $formatMessage({ id: 'confirmation_reservation_subtitle'}) }}</p>
      <reservation-info
        :info-resa="infoResa"
      />
    </div>
    <summary-confirmation v-if="$route.meta.isConfirmation" />
    <my-reservation v-else />
    <v-dialog
      v-model="notAvailable"
      width="500"
    >
      <v-card>
        <v-card-title>
          <h2>
            Place indisponible
          </h2>
        </v-card-title>
        <v-card-text>
          La place que vous avez sélectionnée n'est plus disponible
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            @click="closeAndGoBack"
          >
            <v-icon>
              close
            </v-icon>
            Fermer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script>
import { mapState } from 'vuex'

import {
  CONFIRM_SELECT_DAY_REQUEST,
  DELETE_CANDIDAT_RESERVATION_REQUEST,
  FETCH_CANDIDAT_RESERVATION_REQUEST,
  FETCH_CENTER_REQUEST,
  SELECT_DAY,
  SET_MODIFYING_RESERVATION,
  SHOW_ERROR,
  SHOW_SUCCESS,
} from '@/store'

import {
  getFrenchDateTimeFromIso,
} from '../../../../util/frenchDateTime.js'
import SummaryConfirmation from './SummaryConfirmation.vue'
import MyReservation from './MyReservation.vue'
import ReservationInfo from './ReservationInfo.vue'

export default {
  components: {
    SummaryConfirmation,
    MyReservation,
    ReservationInfo,
  },

  props: {
    flagRecap: {
      type: Boolean,
      default: false,
    },
  },

  data () {
    return {
      selectedCheckBox: [],
      notAvailable: false,
    }
  },

  computed: {
    ...mapState(['center', 'timeSlots', 'candidat', 'reservation']),

    title () {
      return this.isConfirmation || this.$route.meta.isConfirmation
        ? `${this.$route.params.modifying === 'modification' ? 'Confirmer la modification' : 'Confirmation'}`
        : 'Ma réservation'
    },

    isConfirmation () {
      return this.$route.meta.isConfirmation !== false &&
        (!this.reservation.booked.isBooked || this.reservation.isModifying)
    },

    infoResa () {
      if (this.isConfirmation) {
        return {
          centre: this.center.selected,
          nom: this.center.selected ? this.center.selected.nom : '',
          adresse: this.center.selected ? this.center.selected.adresse : '',
          date: this.timeSlots.selected ? this.convertIsoDate(this.timeSlots.selected.slot) : '',
        }
      }
      return {
        centre: this.reservation.booked.centre,
        nom: this.reservation.booked.centre ? this.reservation.booked.centre.nom : '',
        adresse: this.reservation.booked.centre ? this.reservation.booked.centre.adresse : '',
        date: this.reservation.booked ? this.convertIsoDate(this.reservation.booked.date) : '',
      }
    },

    disabled () {
      return this.selectedCheckBox.length !== 2
    },
  },

  async mounted () {
    if (this.$route.params.modifying === 'modification') {
      await this.$store.dispatch(SET_MODIFYING_RESERVATION, true)
    }
    await this.getCandidatReservation()
    await this.getSelectedCenterAndDate()
  },

  methods: {
    goToSelectTimeSlot () {
      this.$router.push({
        name: 'time-slot',
        params: {
          month: this.$route.params.month,
          day: this.$route.params.day,
          modifying: this.$route.params.modifying,
        },
      })
    },

    goToSelectCenter () {
      this.$router.push({ name: 'selection-centre', params: { modifying: this.$route.params.modifying } })
    },

    goToHome () {
      this.$router.push({ name: 'candidat-home' })
    },

    closeAndGoBack () {
      this.notAvailable = false
      this.goToSelectTimeSlot()
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
        this.$store.dispatch(SHOW_ERROR, error.message)
      }
    },

    convertIsoDate (dateIso) {
      return `${getFrenchDateTimeFromIso(dateIso)}`
    },

    async getSelectedCenterAndDate () {
      const {
        center: nom,
        departement,
        slot,
      } = this.$route.params
      const selected = this.center.selected
      if (this.$route.meta.isConfirmation) {
        if (!selected) {
          await this.$store.dispatch(FETCH_CENTER_REQUEST, { nom, departement })
          setTimeout(this.getSelectedCenterAndDate, 100)
          return
        }

        const selectedSlot = {
          slot,
          centre: {
            id: selected._id,
            nom,
            geoDepartement: departement,
          },
        }
        try {
          await this.$store.dispatch(SELECT_DAY, selectedSlot)
        } catch (error) {
          this.notAvailable = true
          this.$store.dispatch(SHOW_ERROR, error.message)
        }
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
    display: inline-block;
    margin-left: 0.5em;
    padding-left: 0.5em;
    border-left: 1px solid grey;
  }
</style>
