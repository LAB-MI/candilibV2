z<template>
  <div>
    <refresh-button
        title="Refresh"
        loadingMessage="Chargement"
      >
        Refresh
      </refresh-button>
    <div class="stats-card">
      <span class="stats-card-text-free-places">
        Places disponibles
      </span>
      <span class="slash-wrapper">
        /
      </span>
      Total places
    </div>
    <v-container fluid>
      <v-layout row wrap>
        <v-flex
          class="monitor-wrapper  u-flex--column-on-tablet"
          xs6
          v-for="info in centerInfos"
          :key="info.centre.nom"
        >
          <week-monitor
            :nameCenter="info.centre.nom"
            :centerId="info.centre._id"
            :weeks="info.places"
          />
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
import {
  FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_REQUEST,
  FETCH_ADMIN_INFO_REQUEST,
} from '@/store'
import WeekMonitor from './WeekMonitor.vue'
import RefreshButton from './RefreshButton.vue'

export default {
  components: {
    WeekMonitor,
    RefreshButton,
  },
  computed: {
    centerInfos () {
      return this.$store.state.admin.places.list
    },
  },

  async mounted () {
    await this.$store.dispatch(FETCH_ADMIN_INFO_REQUEST)
    await this.$store.dispatch(FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_REQUEST)
  },
}
</script>

<style lang="postcss">
.monitor-wrapper {
  padding: 2em;
}

.stats-card {
  font-size: 2em;
}

.stats-card-text-free-places {
  height: 100%;
  color: green;
}
</style>
