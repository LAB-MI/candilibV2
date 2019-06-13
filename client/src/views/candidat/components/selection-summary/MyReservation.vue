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

    <modal-confirm
      titleModal="Confirmer l'annulation"
      :formAction="deleteConfirm"
      :penaltyDaysNumber="penaltyDaysNumber"
      :numberOfDaysBeforeDate="numberOfDaysBeforeDate"
      :currentReservationDateTime="currentReservationDateTime"
      :isPenaltyActive="isPenaltyActive"
      :idReservationMessage="cancelReservationMessage"
      idButtonName="recap_reservation_boutton_annuler"
      idMessageButtonRetour="recap_reservation_modal_annuler_boutton_retour"
      idMessageButtonConfirmer="recap_reservation_modal_annuler_boutton_confirmer"
      :disabled="disabled"
      colorButton="#f82249"
      colorButtonConfirmer="error"
      colorButtonRetour="info"
      iconName="delete_forever"
    />
    <modal-confirm
      v-if="isPenaltyActive"
      titleModal="Confirmer la modification"
      :formAction="modifyReservation"
      :penaltyDaysNumber="penaltyDaysNumber"
      :numberOfDaysBeforeDate="numberOfDaysBeforeDate"
      :currentReservationDateTime="currentReservationDate"
      :isPenaltyActive="isPenaltyActive"
      :canBookFrom="canBookFrom"
      :idReservationMessage="modificationReservationMessage"
      idButtonName="recap_reservation_boutton_modifier"
      idMessageButtonRetour="recap_reservation_modal_annuler_boutton_retour"
      idMessageButtonConfirmer="recap_reservation_modal_modification_boutton_continuer"
      :disabled="disabled"
      colorButton="primary"
      colorButtonConfirmer="primary"
      colorButtonRetour="info"
      iconName="edit"
    />

    <v-btn
      v-else
      color="primary"
      @click="modifyReservation"
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

import {
  getFrenchLuxonFromIso,
  getFrenchDateFromIso,
  getFrenchDateTimeFromIso,
  getFrenchLuxonCurrentDateTime,
} from '../../../../util/frenchDateTime.js'

import ModalConfirm from './ModalConfirm'

import {
  DELETE_CANDIDAT_RESERVATION_REQUEST,
  SEND_EMAIL_CANDIDAT_RESERVATION_REQUEST,
  SET_MODIFYING_RESERVATION,
  SHOW_ERROR,
} from '@/store'

export default {
  components: {
    ModalConfirm,
  },

  data () {
    return {
      selectedCheckBox: [],
      dialog: false,
    }
  },

  computed: {
    ...mapState(['center', 'timeSlots', 'candidat', 'reservation']),

    cancelReservationMessage () {
      return `recap_reservation_modal_annuler_body_with${this.isPenaltyActive ? '' : 'out'}_penalty`
    },

    modificationReservationMessage () {
      return 'recap_reservation_modal_modification_body_info_penalty'
    },

    disabled () {
      return this.$store.state.reservation.isDeleting
    },

    isPenaltyActive () {
      const { lastDateToCancel } = this.$store.state.reservation.booked
      if (!lastDateToCancel) {
        return ''
      }
      if (getFrenchLuxonCurrentDateTime() > getFrenchLuxonFromIso(lastDateToCancel)) {
        return true
      }
      return false
    },

    canBookFrom () {
      const { date, lastDateToCancel, timeOutToRetry } = this.reservation.booked
      if ((getFrenchLuxonCurrentDateTime() > getFrenchLuxonFromIso(lastDateToCancel))) {
        return getFrenchLuxonFromIso(date).plus({ days: timeOutToRetry }).toLocaleString({
          weekday: 'long',
          month: 'long',
          day: '2-digit',
          year: 'numeric',
        })
      }
      return ''
    },

    currentReservationDateTime () {
      return getFrenchDateTimeFromIso(this.reservation.booked.date)
    },

    currentReservationDate () {
      return getFrenchDateFromIso(this.reservation.booked.date)
    },

    lastDateToCancelString () {
      const { lastDateToCancel } = this.$store.state.reservation.booked
      if (!lastDateToCancel) {
        return ''
      }
      return getFrenchDateFromIso(lastDateToCancel)
    },

    penaltyDaysNumber () {
      if (this.reservation.booked.timeOutToRetry) {
        return this.reservation.booked.timeOutToRetry
      }
      return false
    },

    numberOfDaysBeforeDate () {
      if (this.reservation.booked) {
        return this.reservation.booked.dayToForbidCancel
      }
      return false
    },
  },

  methods: {
    async modifyReservation () {
      await this.$store.dispatch(SET_MODIFYING_RESERVATION, true)
      this.$router.push({ name: 'selection-centre', params: { modifying: true } })
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

  .va-b {
    vertical-align: baseline;
  }
</style>
