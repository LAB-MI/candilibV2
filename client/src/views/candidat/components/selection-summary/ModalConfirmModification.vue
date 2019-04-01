<template>
  <v-dialog v-model="dialog" persistent max-width="290">
    <template v-slot:activator="{ on }">
      <v-btn
          v-on="on"
          :aria-disabled="disabled"
          :disabled="disabled"
          color="primary"
        >
        {{ $formatMessage({ id: 'confirmation_reservation_boutton_modification_confirmation' }) }}
      </v-btn>
    </template>
    <v-card>
      <v-form
        class="u-full-width"
        :aria-disabled="disabled"
        :disabled="disabled"
        @submit.prevent="confirmReservationModif"
      >
        <v-card-title class="headline">
          Confirmer la modification
        </v-card-title>
        <v-card-text>
        <cancel-reservation-message
          v-if="dateCurrentResservation"
          class="confirm-suppr-text-content"
          :idFormatMessage="cancelReservationMessage"
          :dateCurrentResa="dateCurrentResservation"
          :nbOfDaysBeforeDate="String(NUMBER_OF_DAYS_BEFORE_DATE)"
          :penaltyNb="String(PENALTY_DAYS_NUMBER)"
        />
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="info"
            class="  u-flex  u-flex--center"
            outline
            :aria-disabled="disabled"
            :disabled="disabled"
            @click="dialog = false"
          >
            <v-icon>
              arrow_back_ios
            </v-icon>
            {{ $formatMessage({ id: 'recap_reservation_modal_annuler_boutton_retour' }) }}
          </v-btn>
          <v-btn
            color="primary"
            :aria-disabled="disabled"
            :disabled="disabled"
            type="submit"
          >
            <span>
              {{ $formatMessage({ id: 'recap_reservation_modal_annuler_boutton_confirmer' }) }}
            </span>
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapState } from 'vuex'
import { DateTime } from 'luxon'

import {
  NUMBER_OF_DAYS_BEFORE_DATE,
  PENALTY_DAYS_NUMBER,
} from '@/store'

import {
  dateTimeFromIsoSetLocaleFr,
  dateTimeFromIsoSetLocaleFrToLocalString,
} from '../../../../util/dateTimeWithSetLocale.js'

import CancelReservationMessage from './CancelReservationMessage'

export default {
  components: {
    CancelReservationMessage,
  },

  props: {
    confirmReservationModif: Function,
    disabled: Boolean,
  },

  data () {
    return {
      dialog: false,
      PENALTY_DAYS_NUMBER,
      NUMBER_OF_DAYS_BEFORE_DATE,
    }
  },

  computed: {
    ...mapState(['reservation']),

    cancelReservationMessage () {
      return `recap_reservation_modal_annuler_body_with${this.isPenaltyActive ? '' : 'out'}_penalty`
    },

    dateCurrentResservation () {
      return dateTimeFromIsoSetLocaleFrToLocalString(this.reservation.booked.date)
    },

    isPenaltyActive () {
      const { lastDateToCancel } = this.$store.state.reservation.booked
      if (!lastDateToCancel) {
        return ''
      }
      if (DateTime.local().setLocale('fr') > dateTimeFromIsoSetLocaleFr(lastDateToCancel)) {
        return true
      }
      return false
    },
  },
}
</script>
