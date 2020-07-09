<template>
  <v-alert
    v-if="centers && centers.length"
    type="info"
    class="rounded-corner"
  >
    {{ message }}
    <div v-if="centersUniq && centersUniq.length">
      {{ messageUniq }}
    </div>
  </v-alert>
</template>

<script>
import { FETCH_PARIS_CENTERS_REQUEST, FETCH_PARIS_CENTERS_UNIQ_REQUEST } from '@/store'

import { NB_FOR_CENTERS_75 } from '../faq/FaqJson'
import { mapState } from 'vuex'
export default {
  components: {
  },
  computed: {
    ...mapState({
      centers (state) { return state.parisCenters.list },
      centersUniq (state) { return state.parisCenters.listUniq },
    }),
    message () {
      return NB_FOR_CENTERS_75(this.centers)
    },
    messageUniq () {
      return `Pour les centres suivants ${this.centersUniq?.join(', ')}, veuillez contacter le service Candilib 75 en cas de problème.`
    },
  },
  mounted () {
    this.$store.dispatch(FETCH_PARIS_CENTERS_REQUEST)
    this.$store.dispatch(FETCH_PARIS_CENTERS_UNIQ_REQUEST)
  },
}
</script>
