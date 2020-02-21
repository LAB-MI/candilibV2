<template>
  <div>
    <page-title>
      {{ $formatMessage({ id: 'tableau_de_bord'}) }}
      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <div
            v-on="on"
          >
            &nbsp;
            (&nbsp;
            <strong class="text-free-places">
              {{ `${countPlacesForAllCenters.totalBookedPlaces}` }}
            </strong>
            &nbsp;
            <strong>
              /
            </strong>
            &nbsp;
            <strong>
              {{ `${countPlacesForAllCenters.totalPlaces}` }}
            </strong>
            &nbsp;)
            &nbsp;
          </div>
        </template>
        <span>
          Total Places reservées des centres / Total places des centres
        </span>
      </v-tooltip>
    </page-title>

    <v-container
      fluid
      class="less-padding"
    >
      <div class="stats-card">
        <div class="text-xs-right">
          <refresh-button
            :is-loading="isLoading"
            @click="reloadWeekMonitor"
          />
        </div>
      </div>

      <v-layout
        row
        wrap
      >
        <v-flex
          v-for="info in placeByCentreInfos"
          :key="info.centre.nom"
          class="monitor-wrapper"
          lg6
          xs12
        >
          <week-monitor
            :name-center="info.centre.nom"
            :center-id="info.centre._id"
            :weeks="info.places"
            :is-loading="isLoading"
          />
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import {
  FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_REQUEST,
} from '@/store'
import WeekMonitor from './WeekMonitor.vue'
import { RefreshButton } from '@/components'

export default {
  components: {
    RefreshButton,
    WeekMonitor,
  },

  computed: {
    ...mapGetters(['activeDepartement', 'countPlacesForAllCenters']),

    placeByCentreInfos () {
      return this.$store.state.admin.places.list
    },

    isLoading () {
      return this.$store.state.admin.places.isFetching
    },
  },

  watch: {
    async activeDepartement (newValue) {
      await this.reloadWeekMonitor()
    },
  },

  async mounted () {
    if (this.activeDepartement) {
      await this.reloadWeekMonitor()
    }
  },

  methods: {
    async reloadWeekMonitor () {
      await this.$store.dispatch(FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_REQUEST)
    },
  },
}
</script>

<style scope lang="postcss">
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

.text-free-places {
  color: green;
}
</style>
