<template>
<div>
  <h4>
    {{ $formatMessage({ id: 'recap_reservation_confirmee' }) }}
    &nbsp;
    <v-icon color="success">
      check
    </v-icon>
  </h4>
  <p>
    {{ $formatMessage({ id: 'recap_reservation_email_confirmee' }) }}
    <strong>
      {{ candidat.me ? candidat.me.email : '' }}
    </strong>
    &nbsp;
    <v-icon color="success">
      check
    </v-icon>
  </p>
  <p>
    <span v-html="
        $formatMessage(
          {
            id: 'recap_reservation_last_date_to_cancel',
          },
          {
            lastDateToCancelString: `<strong>${lastDateToCancelString}</strong>`,
            penaltyDaysNumber: `<strong>${penaltyDaysNumber}</strong>`,
          },
        )"
    />
    &nbsp;
    <v-icon color="red">
      warning
    </v-icon>
  </p>

  <v-dialog v-model="dialog" persistent max-width="290">
    <template v-slot:activator="{ on }">
      <v-btn color="#f82249" dark v-on="on">
        {{ $formatMessage({ id: 'recap_reservation_boutton_annuler' }) }}
        &nbsp;
        <v-icon>
          delete_forever
        </v-icon>
      </v-btn>
    </template>
    <v-card>
      <v-form
        class="u-full-width"
        :aria-disabled="disabled"
        :disabled="disabled"
        @submit.prevent="deleteConfirm"
      >
        <v-card-title class="headline">
          Confirmer l'annulation
        </v-card-title>
        <v-card-text>
          <cancel-reservation-message
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
            color="error darken-1  va-b"
            :aria-disabled="disabled"
            :disabled="disabled"
            type="submit"
          >
            <span>
              {{ $formatMessage({ id: 'recap_reservation_modal_annuler_boutton_confirmer' }) }}
            </span>
            <v-icon class="pl-2">
              warning
            </v-icon>
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
  <v-btn
    @click="modifyReservation"
    color="primary"
  >
    {{ $formatMessage({ id: 'recap_reservation_boutton_modifier' }) }}
    &nbsp;
    <v-icon>
      edit
    </v-icon>
  </v-btn>
  <v-btn
    color="success"
    @click="resendEmailConfirmation"
  >
      {{ $formatMessage({ id: 'recap_reservation_boutton_renvoyer_email' }) }}
      &nbsp;
      <v-icon>
        mail
      </v-icon>
  </v-btn>
</div>
</template>

<script>
import { mapState } from 'vuex'
import { DateTime } from 'luxon'

import {
  dateTimeFromIsoSetLocaleFr,
  dateTimeFromIsoSetLocaleFrToLocalString,
} from '../../../../util/dateTimeWithSetLocale.js'

import CancelReservationMessage from './CancelReservationMessage'

import {
  DELETE_CANDIDAT_RESERVATION_REQUEST,
  NUMBER_OF_DAYS_BEFORE_DATE,
  PENALTY_DAYS_NUMBER,
  SEND_EMAIL_CANDIDAT_RESERVATION_REQUEST,
  SET_MODIFYING_RESERVATION,
  SHOW_ERROR,
} from '@/store'

export default {
  components: {
    CancelReservationMessage,
  },
  data () {
    return {
      selectedCheckBox: [],
      dialog: false,
      PENALTY_DAYS_NUMBER,
      NUMBER_OF_DAYS_BEFORE_DATE,
    }
  },

  computed: {
    ...mapState(['center', 'timeSlots', 'candidat', 'reservation']),

    cancelReservationMessage () {
      return `recap_reservation_modal_annuler_body_with${this.isPenaltyActive ? '' : 'out'}_penalty`
    },

    disabled () {
      return this.$store.state.reservation.isDeleting
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

    dateCurrentResservation () {
      return dateTimeFromIsoSetLocaleFrToLocalString(this.reservation.booked.date)
    },

    lastDateToCancelString () {
      const { lastDateToCancel } = this.$store.state.reservation.booked
      if (!lastDateToCancel) {
        return ''
      }
      return dateTimeFromIsoSetLocaleFrToLocalString(lastDateToCancel)
    },

    penaltyDaysNumber () {
      return PENALTY_DAYS_NUMBER
    },
  },

  methods: {
    async modifyReservation () {
      await this.$store.dispatch(SET_MODIFYING_RESERVATION, true)
      this.$router.push({ name: 'selection-centre' })
    },

    async deleteConfirm () {
      try {
        await this.$store.dispatch(DELETE_CANDIDAT_RESERVATION_REQUEST)
        this.dialog = false
        this.$router.push({ name: 'candidat-home' })
      } catch (error) {
        this.$store.dispatch(SHOW_ERROR, error.message)
      }
    },

    async resendEmailConfirmation () {
      try {
        await this.$store.dispatch(SEND_EMAIL_CANDIDAT_RESERVATION_REQUEST)
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

  .confirm-suppr-text-content {
  }

  .va-b {
    vertical-align: baseline;
  }
</style>
