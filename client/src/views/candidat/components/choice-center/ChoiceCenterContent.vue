<template>
    <a @click="selectCenter(center.centre._id)">
      <h2>{{ center.centre.nom }}</h2>
      <h4>{{ center.centre.adresse }}</h4>
      <h4>{{ center.centre.departement }} {{ center.centre.nom }}</h4>
      <hr>
    </a>
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
    selectCenter (centerId) {
      console.log('centerId', centerId)
      this.$store.dispatch(SELECT_CENTER, centerId)
    },
  },
}
</script>

<style>
</style>
