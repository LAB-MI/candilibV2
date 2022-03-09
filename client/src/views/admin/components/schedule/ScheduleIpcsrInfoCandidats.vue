<template>
  <v-card class="max-h-72 m-6">
    <big-loading-indicator :is-loading="isFetching" />

    <v-data-table
      v-if="!isFetching && candidats.length"
      :headers="headers"
      :items="candidats"
      :items-per-page="-1"
    />
  </v-card>
</template>

<script>

import { mapState } from 'vuex'
import { BigLoadingIndicator } from '@/components'

import { FETCH_CRENEAU_CANDIDATS_BY_ID_REQUEST } from '@/store'

export default {
  components: {
    BigLoadingIndicator,
  },
  props: {
    creneauCandidatIds: {
      type: Array,
      default () { return [] },
    },
  },
  data () {
    return {
      headers: [
        { text: ' ', value: 'hour' },
        { text: 'NEPH', value: 'candidat.codeNeph' },
        { text: 'Nom', value: 'candidat.nomNaissance' },
        { text: 'Prénom', value: 'candidat.prenom' },
        { text: 'Courriel', value: 'candidat.email' },
        { text: 'Portable', value: 'candidat.portable' },
      ],
    }
  },
  computed: {
    ...mapState({
      candidats: (state) => state?.candidats?.listWithCreneau || [],
      isFetching: (state) => state?.candidats?.isFetchingList,
    }),
  },
  async mounted () {
    await this.getCandidatsById(this.creneauCandidatIds)
  },
  methods: {
    async getCandidatsById (creneauCandidatIds) {
      this.isLoadingCandidats = true
      const departement = this.$store.getters.activeDepartement
      await this.$store.dispatch(FETCH_CRENEAU_CANDIDATS_BY_ID_REQUEST, { creneauCandidatIds, departement })
      this.isLoadingCandidats = false
    },
  },
}
</script>
