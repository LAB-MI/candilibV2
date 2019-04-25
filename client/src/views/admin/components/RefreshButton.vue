<template>
    <div class="text-xs-center">
        <v-btn
            :disabled="!!dialog"
            :loading="!!dialog"
            class="white--text"
            color="primary darken-2"
            @click="reloadWeekMonitor"
        >
            {{ title }}
        </v-btn>
        <v-dialog
            v-model="dialog"
            hide-overlay
            persistent
            width="300"
        >
            <v-card
            color="primary"
            dark
            >
            <v-card-text>
                {{ loadingMessage }}
                <v-progress-linear
                indeterminate
                color="white"
                class="mb-0"
                ></v-progress-linear>
            </v-card-text>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
import { FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_REQUEST } from '@/store'

export default {
  props: {
    title: String,
    loadingMessage: String,
  },
  data () {
    return {
      dialog: true,
    }
  },
  methods: {
    async reloadWeekMonitor () {
      this.dialog = true
      await this.$store.dispatch(FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_REQUEST)
      this.dialog = this.$store.state.admin.placesByCentre.isFetching
    },
  },

  async mounted () {
    this.dialog = this.$store.state.admin.placesByCentre.isFetching
  },
}
</script>
