<template>
  <div>
    <v-container fluid>
      <v-layout row wrap>
        <v-flex
          class="monitor-wrapper"
          xs6
          v-for="info in centerInfos"
          :key="info.title"
        >
          <week-monitor
            :nameCenter="info.title"
            :weeks="info.weeks"
          />
        </v-flex>
      </v-layout>
    </v-container>
    <v-layout column wrap>
      <div
        class="div-gestion"
        v-for="item in buttonGestion"
        :key="item.title"
      >
        <v-btn @click="goToGestionPlannings">
          <v-icon class="button-icon">
            {{ item.icon }}
          </v-icon>
          <span>
            {{ item.title }}
          </span>
        </v-btn>
      </div>
    </v-layout>
  </div>
</template>

<script>
import WeekMonitor from './WeekMonitor.vue'

export default {
  components: {
    WeekMonitor,
  },
  data () {
    return {
      centerInfos: [
        {
          title: 'BOBIGNY',
          weeks: Array(20).fill(true)
          .map((item, index) => ({ weekNumber: 'S' + index, stats: '40/100' })),
        },
        {
          title: 'ROSNY',
          weeks: Array(20).fill(true)
          .map((item, index) => ({ weekNumber: 'S' + index, stats: '20/100' })),
        },
        {
          title: 'SAINT-BRICE',
          weeks: Array(20).fill(true)
          .map((item, index) => ({ weekNumber: 'S' + index, stats: '30/100' })),
        },
        {
          title: 'VILLEPINTE',
          weeks: Array(20).fill(true)
          .map((item, index) => ({ weekNumber: 'S' + index, stats: '10/100' })),
        },
      ],
      buttonGestion: [
        {
          icon: 'calendar_today',
          title: 'Gestion des plannings IPCSR',
        },
        {
          icon: 'list',
          title: 'Gestion des candidats',
        },
      ],
    }
  },

  methods: {
    goToGestionPlannings () {
      this.$router.push({ name: 'gestion-plannings' })
    },
  },
}
</script>

<style lang="postcss" scoped>
.monitor-wrapper {
  padding: 2em;
}
</style>
