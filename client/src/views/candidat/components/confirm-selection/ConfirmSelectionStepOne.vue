<template>
  <div class="text--center" v-if="!timeSlots.confirmed">
    <p>
      <strong>{{ $formatMessage({ id: 'candidat_confirmation_reservation_checkbox_title' }) }}</strong>
    </p>
    <v-card-actions>
      <v-form
        class="u-full-width"
        :aria-disabled="disabled"
        :disabled="disabled"
        @submit.prevent="confirmReservation"
      >
      <v-checkbox
        v-model="selectedCheckBox"
        :label="$formatMessage({ id: 'candidat_confirmation_reservation_checkbox_accompagner' })"
        value="companion"
      ></v-checkbox>
      <v-checkbox
        v-model="selectedCheckBox"
        :label="$formatMessage({ id: 'candidat_confirmation_reservation_checkbox_double_commande' })"
        value="doubleControlCar"
      ></v-checkbox>

      <v-flex d-flex>
        <v-spacer></v-spacer>
        <v-btn
          outline
          color="red"
          @click="goToSelectTimeSlot()"
        >
        {{ $formatMessage({ id: 'candidat_confirmation_reservation_boutton_retour' } )}}
        </v-btn>
        <v-btn
          :aria-disabled="disabled"
          :disabled="disabled"
          type="submit"
          color="primary"
        >
        {{ $formatMessage({ id: 'candidat_confirmation_reservation_boutton_confirmation' } )}}
        </v-btn>
      </v-flex>
      </v-form>
    </v-card-actions>
    </div>
    <div class="text--center" v-else>
    <h4>
      {{ $formatMessage({ id: 'candidat_recap_reservation_confirmée' }) }}
      &nbsp;
      <v-icon color="success">
      check
      </v-icon>
    </h4>
    <h4>
      {{ $formatMessage({ id: 'candidat_recap_reservation_email_confirmée' }) }}
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
import { DateTime } from 'luxon'
import { mapState } from 'vuex'

import {
  FETCH_CENTER_REQUEST,
  SHOW_ERROR,
  SELECT_DAY,
  CONFIRM_SELECT_DAY_REQUEST,
} from '@/store'

export default {
  data () {
    return {
      selectedCheckBox: [],
    }
  },

  computed: {
    ...mapState([
      'center',
      'timeSlots',
      'candidat',
      'reservation',
    ]),
    disabled () {
      return this.selectedCheckBox.length !== 2 || this.timeSlots.isSelecting
    },
  },

  methods: {
    goToSelectTimeSlot () {
      this.$router.back()
    },
    goToHome () {
      this.$router.push({ name: 'candidat-home' })
    },

    async confirmReservation () {
      const selected = {
        ...this.timeSlots.selected,
        isAccompanied: true,
        hasDualControlCar: true,
      }
      try {
        await this.$store.dispatch(CONFIRM_SELECT_DAY_REQUEST, selected)
        this.$router.push({ name: 'candidat-home' })
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
    },
  },

  mounted () {
    this.getSelectedCenterAndDate()
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
</style>
