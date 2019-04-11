<template>
  <div>
    <h1>
      Home page admin
    </h1>
    <!-- <v-btn @click="goToValidateByAurige">
      list valide par aurige
    </v-btn> -->
    <v-layout justify-space-around row wrap>
      <v-flex xs6>
        <!-- <cancel-crenaux-alert /> -->
        <week-monitor />
      </v-flex>
      <v-flex xs6>
        <!-- <cancel-crenaux-alert /> -->
        <week-monitor />
      </v-flex>
      <v-flex xs6>
        <!-- <cancel-crenaux-alert /> -->
        <week-monitor />
      </v-flex>
      <v-flex xs6>
        <!-- <cancel-crenaux-alert /> -->
        <week-monitor />
      </v-flex>
    </v-layout>
  </div>
</template>

<script>
// import CancelCrenauxAlert from './CancelCrenauxAlert.vue'
import WeekMonitor from './WeekMonitor.vue'

export default {
  components: {
    // CancelCrenauxAlert,
    WeekMonitor,
  },

  data () {
    return {
    }
  },

  methods: {
    // goToCandidatList () {
    //   this.$router.push({ name: 'admin-aurige' })
    // },
    // goToValidateByAurige () {
    //   this.$router.push({ name: 'admin-aurige', hash: '#aurigeValidation' })
    // },
  },
}
</script>
