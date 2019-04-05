<template>
  <div class="text--center" v-if="!timeSlots.confirmed">
    <p>
      <strong>{{ $formatMessage({ id: 'confirmation_reservation_checkbox_title' }) }}</strong>
    </p>
    <v-card-actions>
      <v-form
        class="u-full-width  u-flex  u-flex--column  u-flex--center"
        :aria-disabled="disabled"
        :disabled="disabled"
        @submit.prevent="confirmReservation"
      >
        <div>
          <v-checkbox
            v-model="selectedCheckBox"
            :label="$formatMessage({ id: 'confirmation_reservation_checkbox_accompagner' })"
            value="companion"
          ></v-checkbox>

          <v-checkbox
            v-model="selectedCheckBox"
            :label="$formatMessage({ id: 'confirmation_reservation_checkbox_double_commande' })"
            value="doubleControlCar"
          ></v-checkbox>
        </div>

        <v-flex d-flex>
          <v-spacer></v-spacer>
          <v-btn
            outline
            color="info"
            :disabled="isBackButtonDisabled"
            :aria-disabled="isBackButtonDisabled"
            @click="goToSelectTimeSlot"
          >
            <v-icon>
              arrow_back_ios
            </v-icon>
            {{ $formatMessage({ id: 'confirmation_reservation_boutton_retour' } )}}
          </v-btn>
          <v-btn
            :aria-disabled="disabled"
            :disabled="disabled"
            type="submit"
            color="primary"
          >
            {{ $formatMessage({ id: 'confirmation_reservation_boutton_confirmation' } )}}
          </v-btn>
        </v-flex>
      </v-form>
    </v-card-actions>
    </div>
    <div class="text--center" v-else>
    <h4>
      {{ $formatMessage({ id: 'recap_reservation_confirmee' }) }}
      &nbsp;
      <v-icon color="success">
        check
      </v-icon>
    </h4>
    <h4>
      {{ $formatMessage({ id: 'recap_reservation_email_confirmee' }) }}
      <strong>{{ candidat.me ? candidat.me.email : '' }}</strong>
      &nbsp;
      <v-icon color="success">
      check
      </v-icon>
    </h4>
    <v-btn @click="goToHome()" >
      Retour à l'accueil
    </v-btn>
  </div>
</template>

<script>
import { mapState } from 'vuex'

import {
  getFrenchDateFromIsoToString,
} from '@/util/dateTimeWithSetLocale.js'
import {
  SHOW_ERROR,
  CONFIRM_SELECT_DAY_REQUEST,
} from '@/store'

export default {
  data () {
    return {
      selectedCheckBox: [],
      isBackButtonDisabled: false,
    }
  },

  computed: {
    ...mapState([
      'candidat',
      'center',
      'reservation',
      'timeSlots',
    ]),

    disabled () {
      return this.selectedCheckBox.length !== 2 || this.timeSlots.isSelecting
    },

    isModifying () {
      if ((this.$route.params.modifying || this.reservation.isModifying) && this.reservation.booked.date) {
        return true
      }
      return false
    },
  },

  methods: {
    goToSelectTimeSlot () {
      this.$router.push({ name: 'time-slot', params: { modifying: this.$route.params.modifying } })
    },

    goToHome () {
      this.$router.push({ name: 'candidat-home' })
    },

    async confirmReservation () {
      this.isBackButtonDisabled = true
      const selected = {
        ...this.timeSlots.selected,
        isAccompanied: true,
        hasDualControlCar: true,
      }
      try {
        await this.$store.dispatch(CONFIRM_SELECT_DAY_REQUEST, selected)
        this.$router.push({ name: 'candidat-home' })
      } catch (error) {
        this.$store.dispatch(SHOW_ERROR, error.message)
      }
      this.isBackButtonDisabled = false
    },

    convertIsoDate (dateIso) {
      return `${getFrenchDateFromIsoToString(dateIso)}`
    },
  },
}
</script>

<style lang="postcss" scoped>
  h4 {
    padding-bottom: 2em;
    text-transform: uppercase;
  }
</style>
