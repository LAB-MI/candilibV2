<template>
<div>
  <h4>
    {{ $formatMessage({ id: 'recap_reservation_confirmée' }) }}
    &nbsp;
    <v-icon color="success">
      check
    </v-icon>
  </h4>
  <h4>
    {{ $formatMessage({ id: 'recap_reservation_email_confirmée' }) }}
    <span color="primary">{{ candidat.me ? candidat.me.email : '' }}</span>
    &nbsp;
    <v-icon color="success">
      check
    </v-icon>
  </h4>
  <h4>
    si vous annulé apres le
    "{{ lastDateToCancelString }}"
    vous serez pénalisé de {{ penaltyDaysNumber }}
    &nbsp;
    <v-icon color="red">
      warning
    </v-icon>
  </h4>
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
          <div class="confirm-suppr-text-content">
            <v-subheader v-if="isPenaltyActive" class="red--text">
              <p>
                {{ $formatMessage({ id: 'recap_reservation_modal_annuler_body' }) }}
              </p>
              {{ isPenaltyTrue }}
            </v-subheader>
            <v-subheader v-else class="red--text">
              <p>
                {{ $formatMessage({ id: 'recap_reservation_modal_annuler_body' }) }}
              </p>
              {{ isPenaltyFalse }}
            </v-subheader>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="red darken-1" flat @click="dialog = false">
            {{ $formatMessage({ id: 'recap_reservation_modal_annuler_boutton_retour' }) }}
          </v-btn>
          <v-btn
            color="red darken-1"
            flat
            :aria-disabled="disabled"
            :disabled="disabled"
            type="submit"
          >
            {{ $formatMessage({ id: 'recap_reservation_modal_annuler_boutton_confirmer' }) }}
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
  <router-link :to="{ name: 'selection-centre' }">
    <v-btn color="primary">
      {{ $formatMessage({ id: 'recap_reservation_boutton_modifier' }) }}
      &nbsp;
      <v-icon>
        edit
      </v-icon>
    </v-btn>
  </router-link>
  <v-btn
    color="success"
    @click="resendEmailConfrimation"
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
  DELETE_CANDIDAT_RESERVATION_REQUEST,
  PENALTY_DAYS_NUMBER,
  SEND_EMAIL_CANDIDAT_RESERVATION_REQUEST,
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
      return this.$store.state.reservation.isDeleting
    },

    isPenaltyActive () {
      const { lastDateToCancel } = this.$store.state.reservation.booked
      if (!lastDateToCancel) {
        return ''
      }
      if (DateTime.local() > DateTime.fromISO(lastDateToCancel)) {
        return true
      }
      return false
    },

    isPenaltyTrue () {
      return `avec une pénalité de ${PENALTY_DAYS_NUMBER}`
    },

    isPenaltyFalse () {
      const { lastDateToCancel } = this.$store.state.reservation.booked
      return `sans pénalité, valable jusqu'au ${DateTime.fromISO(lastDateToCancel)
        .toLocaleString({ weekday: 'long', month: 'long', day: '2-digit', year: 'numeric' })}`
    },

    lastDateToCancelString () {
      const { lastDateToCancel } = this.$store.state.reservation.booked
      if (!lastDateToCancel) {
        return ''
      }
      return DateTime.fromISO(lastDateToCancel)
        .toLocaleString({
          weekday: 'long',
          month: 'long',
          day: '2-digit',
          year: 'numeric',
        })
    },

    penaltyDaysNumber () {
      return PENALTY_DAYS_NUMBER
    },
  },

  methods: {
    async deleteConfirm () {
      try {
        await this.$store.dispatch(DELETE_CANDIDAT_RESERVATION_REQUEST)
        this.dialog = false
        this.$router.push({ name: 'candidat-home' })
      } catch (error) {
        this.$store.dispatch(SHOW_ERROR, error.message)
      }
    },

    async resendEmailConfrimation () {
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

  .redirectTextColor {
    color: blue;
  }

  .confirm-suppr-text-content {
    height: 200px;
    overflow-y: scroll;
  }
</style>
