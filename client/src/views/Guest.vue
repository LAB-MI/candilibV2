<template>
  <div class="u-flex  u-flex--column">
    <candidat-header />
    <router-view />
  </div>
</template>

<script>
import CandidatHeader from '@/views/candidat/components/CandidatHeader.vue'

export default {
  name: 'CandilibGuest',

  components: {
    CandidatHeader,
  },
}
</script>
