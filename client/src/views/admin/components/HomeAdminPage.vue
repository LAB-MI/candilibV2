<template>
  <div>
    <page-title>
      {{ $formatMessage({ id: 'Recherche'}) }}
    </page-title>
    <div class="u-flex  u-flex--center  u-flex--v-start">
      <search-inspecteur class="search-input" />
    </div>
    <monitors />
  </div>
</template>

<script>
import SearchInspecteur from './SearchInspecteur'
import Monitors from './Monitors.vue'
import { getFrenchLuxonCurrentDateTime } from '@/util'

export default {
  components: {
    Monitors,
    SearchInspecteur,
  },

  methods: {
    goToGestionPlannings () {
      const { centre } = this.$store.state.admin.places.list[0]
      this.$router.push({
        name: 'gestion-planning',
        params: {
          center: centre._id,
          date: getFrenchLuxonCurrentDateTime().toSQLDate(),
        },
      })
    },
  },
}
</script>

<style lang="postcss" scoped>
.search-input {
  margin: 1em 1em;
}

.stats-card {
  font-size: 2em;
}

.stats-card-text-free-places {
  height: 100%;
  color: green;
}
</style>
