<template>
  <v-card style="max-width: 100vw">
    <div v-if="reservation.booked">
      <section>
        <header class="candidat-section-header">
          <h2 class="candidat-section-header__title">
            Ma réservation
          </h2>
        </header>
      </section>
      <confirm-selection :flagRecap="true"/>
    </div>
    <div v-else>
      <center-selection/>
    </div>
  </v-card>
</template>

<script>
import { mapState } from 'vuex'

import {
  FETCH_CANDIDAT_RESERVATION_REQUEST,
  FETCH_MY_PROFILE_REQUEST,
  SHOW_ERROR,
} from '@/store'

import ConfirmSelection from './candidat/components/confirm-selection/ConfirmSelection.vue'
import CenterSelection from './candidat/components/center-selection/CenterSelection.vue'

export default {
  components: {
    ConfirmSelection,
    CenterSelection,
  },

  name: 'candidat-home',

  computed: {
    ...mapState(['candidat', 'reservation']),
  },
  data () {
    return {
      candidatStatus: true,
    }
  },

  methods: {
    async getCandidatReservation () {
      try {
        await this.$store.dispatch(FETCH_CANDIDAT_RESERVATION_REQUEST)
      } catch (error) {
        this.$store.dispatch(SHOW_ERROR, error.message)
      }
    },

    async getMyProfile () {
      try {
        await this.$store.dispatch(FETCH_MY_PROFILE_REQUEST)
      } catch (error) {
        this.$store.dispatch(SHOW_ERROR, error.message)
      }
    },
  },

  async mounted () {
    this.$router.replace({ name: 'candidat-presignup' })
    await this.getCandidatReservation()
    await this.getMyProfile()
  },
}
</script>
