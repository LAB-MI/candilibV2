<template>
  <div>
    <v-toolbar>
      <v-toolbar-title>
        CHOIX DU CENTRE
      </v-toolbar-title>
    </v-toolbar>
    <v-card>
      <v-list two-line>
        <center-selection-content v-for="(center, index) in centers" :key="index" :center="center" />
      </v-list>
    </v-card>
  </div>
</template>

<script>
import CenterSelectionContent from './CenterSelectionContent'
import { FETCH_CENTERS_REQUEST } from '@/store/centers'

export default {
  components: {
    CenterSelectionContent,
  },
  data () {
    return {
      centers: [],
    }
  },
  beforeMount () {
    this.$store.dispatch(FETCH_CENTERS_REQUEST)
    this.centers = this.$store.state.centers.fetchedCenters
  },
}
</script>

<style>
</style>
