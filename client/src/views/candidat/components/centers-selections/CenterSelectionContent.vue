<template>
  <v-list-tile :ripple="!!center.count" @click="selectCenter(center)">
    <v-list-tile-content>
      <v-list-tile-title>{{ center.centre.nom }}</v-list-tile-title>
      <v-list-tile-sub-title>{{ center.centre.adresse }}</v-list-tile-sub-title>
      <v-list-tile-sub-title>{{ center.centre.departement }} {{ center.centre.nom }}</v-list-tile-sub-title>
    </v-list-tile-content>
    <v-icon :color="center.count ? 'grey lighten-1' : ''">
      fiber_manual_record
    </v-icon>
  </v-list-tile>
</template>

<script>
import { SELECT_CENTER } from '@/store/centers'
export default {
  components: {
  },
  props: {
    center: Object,
  },
  methods: {
    selectCenter (center) {
      if (!center.count) {
        return
      }
      this.$store.dispatch(SELECT_CENTER, center)
    },
  },
}
</script>

<style>
</style>
