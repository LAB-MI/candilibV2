<template>
    <div>
        <h1>C<span style="color: red;">A</span>NDILIB</h1>
        <!-- <div>
            INFO SELECTED CENTER
            {{ selectedCenter.centre.nom }}
            {{ selectedCenter.centre.adresse }}
            {{ selectedCenter.centre.departement }} {{ selectedCenter.centre.nom }}
        </div> -->
        <h2>CHOIX D'UNE DATE</h2>
        <hr>
        <!-- <date-choice-content v-for="(month, index) in fetchedDates" :key="index" /> -->
        <DateChoiceContent v-for="(month, index) in fetchedDates" :key="index" :monthBlock="month"/>
    </div>
</template>

<script>
import DateChoiceContent from './DateChoiceContent'
import { FETCH_DATES_REQUEST } from '@/store/dateChoice'
export default {
  components: {
    DateChoiceContent,
  },
  props: {
    selectedCenter: Object,
  },
  data () {
    return {
      centers: [],
      fetchedDates: [],
    }
  },
  beforeMount () {
    // if (this.$store.state.centers.selectedCenter !== undefined) {
    // this.$store.dispatch(FETCH_DATES_REQUEST, this.$store.state.centers.selectedCenter)
    this.$store.dispatch(FETCH_DATES_REQUEST, {})
    this.fetchedDates = this.$store.state.dateChoice.fetchedDates
    console.log('TCL: beforeMount -> fetchedDates', this.fetchedDates, this.$store.state.dateChoice.fetchedDates)
  },
}
</script>

<style>
</style>
