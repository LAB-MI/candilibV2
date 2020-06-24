<template>
  <v-card>
    <page-title :title="$formatMessage({ id: 'home_choix_du_departement' })" />
    <message-info-centers-75 v-if="isFrom75" />
    <div class="text-center">
      <v-icon color="black">
        info
      </v-icon>
      <span>{{ $formatMessage({ id: 'messsage_mise_a_disposition_des_places' }) }}</span>
    </div>
    <v-list three-line>
      <v-list-item-content class="pl-5  pr-5">
        <v-text-field
          v-model="filtre"
          label="Rechercher un département:"
          placeholder="exemple: 94"
          rounded
          outlined
          clearable
          width="100"
        >
          search
        </v-text-field>
      </v-list-item-content>
      <departement-selection-content
        v-for="({geoDepartement, centres, count}) in departements"
        :key="geoDepartement"
        :geo-departement-infos="{ geoDepartement, count, centres }"
      />
    </v-list>
  </v-card>
</template>

<script>
import { mapState } from 'vuex'

import { FETCH_DEPARTEMENTS_INFOS_REQUEST } from '@/store'

import DepartementSelectionContent from './DepartementSelectionContent'
import MessageInfoCenters75 from './MessageInfoCenters75'

export default {
  components: {
    DepartementSelectionContent,
    MessageInfoCenters75,
  },
  data () {
    return {
      filtre: '',
    }
  },
  computed: {
    ...mapState({
      departements (state) {
        return state.departements.geoDepartementsInfos
          .filter(item => this.filtre ? (item.geoDepartement === this.filtre) : item)
      },
      isFrom75 (state) { return (state.candidat.me?.homeDepartement || state.candidat.me?.departement) === '75' },
    }),
  },
  mounted () {
    this.$store.dispatch(FETCH_DEPARTEMENTS_INFOS_REQUEST)
  },

}
</script>
