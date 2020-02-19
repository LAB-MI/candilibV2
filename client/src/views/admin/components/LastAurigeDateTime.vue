<template>
  <div
    style="background-color: #2196f3; border: solid 2px #f82249; margin-top: -5vh;"
  >
    <span
      class="u-flex  u-flex--center  u-flex--v-start headline"
      color="white"
    >
      Date et heure du dernier passage d'Aurige: &nbsp;
      <strong>
        {{ lastDateTimeAurige }}
      </strong>
      <refresh-button
        :is-loading="isLoading"
        @click="reloadLastDateTimeAurige"
      />
    </span>
  </div>
</template>

<script>
import { FETCH_AURIGE_LAST_DATETIME_REQUEST } from '@/store'
import { RefreshButton } from '@/components'

import { getFrenchDateTimeFromIso } from '../../../util/frenchDateTime'

export default {
  components: {
    RefreshButton,
  },
  computed: {
    lastDateTimeAurige () {
      return getFrenchDateTimeFromIso(this.$store.state.aurige.lastSyncDateTime)
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
