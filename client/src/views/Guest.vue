<template>
  <div class="u-fullvp-height  u-flex  u-flex--column">
    <candidat-header/>
    <router-view />
  </div>
</template>

<script>
import CandidatHeader from '@/views/candidat/components/CandidatHeader.vue'

export default {
  components: {
    CandidatHeader,
  },
}
</script>

<style lang="postcss" scoped>
  .u-fullvp-height {
    height: 100vh;
  }
</style>
