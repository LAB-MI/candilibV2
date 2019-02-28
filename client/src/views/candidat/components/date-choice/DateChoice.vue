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
        <!-- <date-choice-centent v-for="(center, index) in centers" :key="index" :center="center" /> -->
        <p>
          <!-- {{ dateStart }} -->
        </p>
        <p>
          <!-- {{ dateEnd }} -->
        </p>
        <DateChoiceContent />
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
    }
  },
  beforeMount () {
      if (this.$store.state.centers.selectedCenter !== undefined) {
        this.$store.dispatch(FETCH_DATES_REQUEST, this.$store.state.centers.selectedCenter)
      }
  },
}
</script>

<style>
</style>
