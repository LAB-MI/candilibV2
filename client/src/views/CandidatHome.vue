<template>
  <center-selection />
</template>

<script>
import { mapState } from 'vuex'

import {
  FETCH_CANDIDAT_RESERVATION_REQUEST,
  FETCH_MY_PROFILE_REQUEST,
  SHOW_ERROR,
} from '@/store'

import CenterSelection from './candidat/components/center-selection/CenterSelection.vue'

export default {
  components: {
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
