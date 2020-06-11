<template>
  <v-alert
    v-if="centers && centers.length"
    type="info"
    class="rounded-corner"
  >
    {{ message }}
  </v-alert>
</template>

<script>
import { FETCH_PARIS_CENTERS_REQUEST } from '@/store'

import { NB_FOR_CENTERS_75 } from '../faq/FaqJson'
import { mapState } from 'vuex'
export default {
  components: {
  },
  computed: {
    ...mapState({
      centers (state) { return state.parisCenters.list },
    }),
    message () { return NB_FOR_CENTERS_75(this.centers) },
  },
  mounted () {
    this.$store.dispatch(FETCH_PARIS_CENTERS_REQUEST)
  },
}
</script>
