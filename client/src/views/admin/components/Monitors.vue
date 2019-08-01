<template>
  <div>
    <page-title>
      {{ $formatMessage({ id: 'tableau_de_bord'}) }}
    </page-title>

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
          class="monitor-wrapper"
          lg6
          xs12
          v-for="info in placeByCentreInfos"
          :key="info.centre.nom"
        >
          <week-monitor
            :nameCenter="info.centre.nom"
            :centerId="info.centre._id"
            :weeks="info.places"
            :isLoading="isLoading"
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
      await this.reloadWeekMonitor()
    },
  },

  methods: {
    async reloadWeekMonitor () {
      await this.$store.dispatch(FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_REQUEST)
    },
  },

  async mounted () {
    if (this.activeDepartement) {
      await this.reloadWeekMonitor()
    }
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
