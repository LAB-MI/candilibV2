<template>
  <div class="text-xs-center">
    <v-btn
      :disabled="!!isLoading"
      :loading="!!isLoading"
      class="white--text"
      color="primary darken-2"
      @click="reloadWeekMonitor"
    >
      {{ title }}
    </v-btn>
    <v-dialog
      v-model="isLoading"
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
        >
            </v-progress-linear>
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
  computed: {
    isLoading () {
      return this.$store.state.admin.places.isFetching
    },
  },
  methods: {
    async reloadWeekMonitor () {
      await this.$store.dispatch(FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_REQUEST)
    },
  },
}
</script>
