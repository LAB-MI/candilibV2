<template>
  <v-card>
    <page-title :title="$formatMessage({ id: 'home_choix_du_departement' })" />
    <message-info-centers-75 v-if="isFrom75" />
    <message-info-departement-disable
      v-if="isCandidatHomeDepartementHaveDisableDate.isHaveDisableDate"
      :home-departement="isCandidatHomeDepartementHaveDisableDate.homeDepartement"
      :disable-date="isCandidatHomeDepartementHaveDisableDate.isHaveDisableDate"
    />
    <message-info-places />
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
import MessageInfoPlaces from '../MessageInfoPlaces'
import MessageInfoDepartementDisable from './MessageInfoDepartementDisable'
import { getFrenchLuxonFromIso } from '@/util'

export default {
  components: {
    DepartementSelectionContent,
    MessageInfoCenters75,
    MessageInfoPlaces,
    MessageInfoDepartementDisable,
  },
  data () {
    return {
      filtre: '',
    }
  },
  computed: {
    ...mapState({
      departements (state) {
        return state.departements.geoDepartementsInfosActive
          .filter(item => this.filtre ? (item.geoDepartement === this.filtre) : item)
      },
      isFrom75 (state) { return (state.candidat.me?.homeDepartement || state.candidat.me?.departement) === '75' },
      isCandidatHomeDepartementHaveDisableDate (state) {
        const { geoDepartementsInfos } = state.departements
        const homeDepartement = state.candidat.me?.homeDepartement
        const isHaveDisableDate = geoDepartementsInfos.find(item => (item.geoDepartement === homeDepartement) && item?.disableAt)
        return { isHaveDisableDate: (isHaveDisableDate?.disableAt ? getFrenchLuxonFromIso(isHaveDisableDate.disableAt).toLocaleString('DATE_SHORT') : ''), homeDepartement }
      },
    }),
  },
  mounted () {
    this.$store.dispatch(FETCH_DEPARTEMENTS_INFOS_REQUEST)
  },

}
</script>
