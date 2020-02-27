<template>
  <div class="u-flex  u-flex--center  u-flex--v-start">
    <v-chip
      class="pa-5"
      color="info"
      text-color="white"
      large
    >
      Date et heure du dernier passage d'Aurige: &nbsp;
      <strong>
        {{ lastDateTimeAurige }}
      </strong>
      <v-avatar
        right
        class="pa-5"
      >
        <refresh-button
          :is-loading="isLoading"
          color-btn="white"
          @click="reloadLastDateTimeAurige"
        />
      </v-avatar>
    </v-chip>
  </div>
</template>

<script>
import { FETCH_AURIGE_LAST_DATETIME_REQUEST } from '@/store'
import { RefreshButton } from '@/components'

export default {
  components: {
    RefreshButton,
  },
  computed: {
    lastDateTimeAurige () {
      return this.$store.state.aurige.lastSyncDateTime
    },
    isLoading () {
      return this.$store.state.aurige.isLastSyncDateTimeLoading
    },
  },
  mounted () {
    this.getlastDateTimeSyncAurige()
  },
  methods: {
    getlastDateTimeSyncAurige () {
      this.$store.dispatch(FETCH_AURIGE_LAST_DATETIME_REQUEST)
    },
    reloadLastDateTimeAurige () {
      this.getlastDateTimeSyncAurige()
    },
  },
}
</script>
