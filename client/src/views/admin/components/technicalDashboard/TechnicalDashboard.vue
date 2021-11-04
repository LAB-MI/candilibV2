<template>
  <div>
    <page-title>
      tech admin dashboard
    </page-title>
    <div class="u-flex  u-flex--center  u-flex--v-start">
      <v-btn
        class="primary"
        @click="startAutomate"
      >
        START
      </v-btn>
      <v-btn
        class="error"
        @click="stopAutomate"
      >
        STOP
      </v-btn>
    </div>
  </div>
</template>

<script>
import { START_AUTOMATE_REQUEST, STOP_AUTOMATE_REQUEST, FETCH_STATUS_AUTOMATE_REQUEST } from '@/store'

export default {
  name: 'TechnicalDashboard',
  methods: {
    async startAutomate () {
      await this.$store.dispatch(START_AUTOMATE_REQUEST)
    },
    async stopAutomate () {
      await this.$store.dispatch(STOP_AUTOMATE_REQUEST)
    },
    async getStatusAutomate () {
      await this.$store.dispatch(FETCH_STATUS_AUTOMATE_REQUEST)
    },

  },
}
</script>
