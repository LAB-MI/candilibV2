<template>
  <div>
    <v-toolbar>
      <v-toolbar-title>
        CHOIX DU CENTRE
      </v-toolbar-title>
    </v-toolbar>
    <v-card>
      <v-list two-line>
        <choice-center-content v-for="(center, index) in centers" :key="index" :center="center" />
      </v-list>
    </v-card>
  </div>
</template>

<script>
import choiceCenterContent from './ChoiceCenterContent'
import { FETCH_CENTERS_REQUEST } from '@/store/centers'

export default {
  components: {
    choiceCenterContent,
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
