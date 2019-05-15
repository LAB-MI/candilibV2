<template>
  <div>
    <v-layout class="u-flex  u-flex--center">
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
    <monitors />
    <div class="u-flex  u-flex--center">
      <search-candidat class="search-input"/>
      <search-inspecteur class="search-input" />
    </div>
  </div>
</template>

<script>
import SearchCandidat from './SearchCandidat'
import SearchInspecteur from './SearchInspecteur'
import Monitors from './Monitors.vue'
import { FETCH_ADMIN_INFO_REQUEST } from '@/store'

export default {
  components: {
    Monitors,
    SearchCandidat,
    SearchInspecteur,
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

  methods: {
    goToGestionPlannings () {
      this.$router.push({ name: 'gestion-plannings' })
    },
  },

  async mounted () {
    await this.$store.dispatch(FETCH_ADMIN_INFO_REQUEST)
  },
}
</script>

<style lang="postcss" scoped>
.search-input {
  margin: 0 1em;
}
</style>
