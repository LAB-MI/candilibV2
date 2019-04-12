<template>
  <div>
    <h1>
      Home page admin
    </h1>
    <v-container fluid>
      <v-layout row wrap>
        <v-flex class="monitor-wrapper" v-for="i in 4" :key="`6${i}`" xs6>
          <week-monitor :nameCenter="'nameCenter' + i" />
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
import WeekMonitor from './WeekMonitor.vue'

export default {
  components: {
    WeekMonitor,
  },
}
</script>

<style lang="postcss" scoped>
.monitor-wrapper {
  padding: 2em;
}
</style>
