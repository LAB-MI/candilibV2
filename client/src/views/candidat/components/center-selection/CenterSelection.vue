<template>
  <v-card>
    <page-title :title="$formatMessage({ id: 'home_choix_du_centre' })" />
    <message-info-places />

    <v-list
      style="position: relative;"
      three-line
    >
      <big-loading-indicator :is-loading="center.isFetchingCenters" />
      <center-selection-content
        v-for="center in center.list"
        :key="center._id"
        :center="center"
      />
    </v-list>
    <v-card-actions class="u-flex--center">
      <v-btn
        outlined
        color="info"
        @click="goToSelectDepartement"
      >
        <v-icon>arrow_back_ios</v-icon>Retour
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { mapState } from 'vuex'

import { BigLoadingIndicator } from '@/components'
import CenterSelectionContent from './CenterSelectionContent'
import MessageInfoPlaces from '../MessageInfoPlaces'

import {
  FETCH_CENTERS_REQUEST,
} from '@/store'

export default {
  components: {
    CenterSelectionContent,
    BigLoadingIndicator,
    MessageInfoPlaces,
  },

  computed: {
    ...mapState(['center']),
  },

  async mounted () {
    await this.getCenters()
  },

  methods: {
    async getCenters () {
      const departementInfos = this.$store.state.departements.selectedDepartement
      await this.$store.dispatch(FETCH_CENTERS_REQUEST, this.$route.params.departement || departementInfos.geoDepartement)
    },

    goToSelectDepartement () {
      this.$router.push({
        name: 'selection-departement',
      })
    },
  },
}
</script>
