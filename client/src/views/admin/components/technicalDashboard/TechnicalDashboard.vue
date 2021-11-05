<template>
  <div>
    <page-title>
      tech admin dashboard
    </page-title>
    <v-container>
      <v-row dense>
        <v-col cols="12">
          <v-card
            color="#385F73"
            dark
          >
            <v-card-title class="text-h5">
              {{ statusAutomate.status || 'Empty' }}
            </v-card-title>

            <v-card-subtitle>Listen to your favorite artists and albums whenever and wherever, online and offline.</v-card-subtitle>

            <v-card-actions>
              <v-spacer />
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
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import { START_AUTOMATE_REQUEST, STOP_AUTOMATE_REQUEST, FETCH_STATUS_AUTOMATE_REQUEST } from '@/store'

export default {
  name: 'TechnicalDashboard',

  data () {
    return {
      statusAutomate: { status: 'empty' },
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
      this.statusAutomate = await this.$store.dispatch(FETCH_STATUS_AUTOMATE_REQUEST)
    },

  },
}
</script>
