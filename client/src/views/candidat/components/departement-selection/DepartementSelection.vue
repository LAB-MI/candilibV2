<template>
  <v-card>
    <page-title :title="$formatMessage({ id: 'home_choix_du_departement' })" />
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
        v-for="({departement, centres, count}) in departements"
        :key="departement"
        :departement-infos="{ departement, count, centres }"
      />
    </v-list>
  </v-card>
</template>

<script>
import { mapState } from 'vuex'

import { FETCH_DEPARTEMENTS_INFOS_REQUEST } from '@/store'

import DepartementSelectionContent from './DepartementSelectionContent'
export default {
  components: {
    DepartementSelectionContent,
  },
  data () {
    return {
      filtre: '',
    }
  },
  computed: {
    ...mapState({
      departements (state) {
        return state.departements.departementsInfos
          .filter(item => this.filtre ? (item.departement === this.filtre) : item)
      },
    }),
  },
  mounted () {
    this.$store.dispatch(FETCH_DEPARTEMENTS_INFOS_REQUEST)
  },

}
</script>
