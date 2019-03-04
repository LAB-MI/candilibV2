<template>
  <div>
      <date-choice-content :monthBlock="fetchedDates"/>
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
