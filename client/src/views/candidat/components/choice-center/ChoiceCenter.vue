<template>
    <div>
        <h1>C<span style="color: red;">A</span>NDILIB</h1>
        <h2>CHOIX DU CENTRE</h2>
        <hr>
        <choice-center-content v-for="(center, index) in centers" :key="index" :center="center" />
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
