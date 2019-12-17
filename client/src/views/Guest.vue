<template>
  <div class="u-flex  u-flex--column">
    <candidat-header />
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
