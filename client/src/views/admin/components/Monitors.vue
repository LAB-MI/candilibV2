<template>
  <div>
    <page-title>Tableau de bord</page-title>

    <v-container fluid class="less-padding">
      <div class="stats-card">
        <div class="text-xs-right">
          <refresh-button
            @click="reloadWeekMonitor"
            :isLoading="isLoading"
          />
        </div>
      </div>

      <v-layout row wrap>
        <v-flex
          class="monitor-wrapper  u-flex--column-on-tablet"
          xs6
          v-for="info in placeByCentreInfos"
          :key="info.centre.nom"
        >
          <week-monitor
            :nameCenter="info.centre.nom"
            :centerId="info.centre._id"
            :weeks="info.places"
          />
        </v-flex>
      </v-layout>

      <div class="text-xs-right">
        <span class="stats-card-text-free-places">
          Places disponibles
        </span>
        <span class="slash-wrapper">
          /
        </span>
        Total places
      </div>
    </v-container>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import {
  FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_REQUEST,
  FETCH_INSPECTEURS_BY_DEPARTEMENT_REQUEST,
  FETCH_ADMIN_INFO_REQUEST,
} from '@/store'
import WeekMonitor from './WeekMonitor.vue'
import { RefreshButton } from '@/components'

export default {
  components: {
    RefreshButton,
    WeekMonitor,
  },
  computed: {
    ...mapGetters(['activeDepartement']),
    placeByCentreInfos () {
      return this.$store.state.admin.places.list
    },
    isLoading () {
      return this.$store.state.admin.places.isFetching
    },
  },
  watch: {
    async activeDepartement (newValue, oldValue) {
      if (newValue !== oldValue) {
        await this.$store.dispatch(FETCH_INSPECTEURS_BY_DEPARTEMENT_REQUEST)
        await this.$store.dispatch(FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_REQUEST)
      }
    },
  },
  methods: {
    async reloadWeekMonitor () {
      await this.$store.dispatch(FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_REQUEST)
    },
  },

  async mounted () {
    await this.$store.dispatch(FETCH_ADMIN_INFO_REQUEST)
    await this.$store.dispatch(FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_REQUEST)
  },
}
</script>

<style lang="postcss">
.less-padding {
  padding-top: 0.1em;
}

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
