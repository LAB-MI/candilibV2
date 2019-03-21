<template>
  <div>
    <v-card-title>
      <candidat-title title="Choix du centre" />
    </v-card-title>
    <v-list three-line>
      <center-selection-content
        v-for="center in center.list"
        :key="center._id"
        :center="center"
      />
    </v-list>
  </div>
</template>

<script>
import { mapState } from 'vuex'

import CandidatTitle from '@/views/candidat/components/CandidatTitle.vue'
import CenterSelectionContent from './CenterSelectionContent'
import { FETCH_CENTERS_REQUEST } from '@/store/center'

export default {
  components: {
    CenterSelectionContent,
    CandidatTitle,
  },

  computed: {
    ...mapState(['center']),
  },

  async mounted () {
    await this.getCenters()
  },

  methods: {
    async getCenters () {
      const candidat = this.$store.state.candidat
      if (!candidat || !candidat.me) {
        setTimeout(this.getCenters, 100)
        return
      }
      const { adresse } = candidat.me
      await this.$store.dispatch(FETCH_CENTERS_REQUEST, adresse)
    },
  },
}
</script>
