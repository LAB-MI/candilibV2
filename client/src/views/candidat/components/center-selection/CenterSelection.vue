<template>
  <v-card>
    <section>
      <header class="candidat-section-header">
        <h2 class="candidat-section-header__title">
          {{ $formatMessage({ id: 'candidat_home_choix_du_centre' }) }}
        </h2>
      </header>
    </section>
    <v-list three-line>
      <center-selection-content
        v-for="center in center.list"
        :key="center._id"
        :center="center"
      />
    </v-list>
  </v-card>
</template>

<script>
import { mapState } from 'vuex'
import CenterSelectionContent from './CenterSelectionContent'
import { FETCH_CENTERS_REQUEST } from '@/store/center'

export default {
  components: {
    CenterSelectionContent,
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
