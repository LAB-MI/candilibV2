<template>
  <v-card
    dark
  >
    <v-card-title class="text-h5">
      <v-btn
        class="t-btn-status-automate"
        :color="statusAutomate === 'Started' ? 'green' : 'error'"
        @click="getStatusAutomate"
      >
        ETAT DE L'AUTOMATE: {{ statusAutomate || 'Empty' }}
      </v-btn>
    </v-card-title>

    <v-card-actions>
      <v-spacer />
      <v-btn
        class="primary t-btn-start-automate"
        @click="startAutomate"
      >
        START
      </v-btn>
      <v-btn
        class="error t-btn-stop-automate"
        @click="stopAutomate"
      >
        STOP
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { FETCH_STATUS_AUTOMATE_REQUEST, START_AUTOMATE_REQUEST, STOP_AUTOMATE_REQUEST } from '@/store'

export default {
  name: 'AutomateManager',
  data () {
    return {
      statusAutomate: '',
    }
  },

  async mounted () {
    await this.getStatusAutomate()
  },
  methods: {
    async startAutomate () {
      await this.$store.dispatch(START_AUTOMATE_REQUEST)
      await this.getStatusAutomate()
    },
    async stopAutomate () {
      await this.$store.dispatch(STOP_AUTOMATE_REQUEST)
      await this.getStatusAutomate()
    },
    async getStatusAutomate () {
      const response = await this.$store.dispatch(FETCH_STATUS_AUTOMATE_REQUEST)
      this.statusAutomate = response?.status
    },
  },
}
</script>
