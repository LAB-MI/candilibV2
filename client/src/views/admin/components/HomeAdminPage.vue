<template>
  <div>
    <v-container fluid>
      <v-layout row wrap>
        <v-flex
          class="monitor-wrapper"
          xs6
          v-for="info in centerInfos"
          :key="info.centre.nom"
        >
          <week-monitor
            :nameCenter="info.centre.nom"
            :weeks="info.places"
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

  computed: {
    centerInfos () {
      return this.$store.state.admin.placesByCentre.list
    },
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
