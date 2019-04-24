<template>
  <v-autocomplete
    v-model="selectedCandidat"
    label="Candidats"
    hint="Chercher un candidat par son nom"
    append-outer-icon="search"
    placeholder="Dupont"
    :items="candidats"
    :search-input.sync="searchCandidats"
    return-object
    item-text="nomNaissance"
    item-value="_id"
  />
</template>

<script>
import { FETCH_SEARCH_CANDIDATS_REQUEST } from '@/store'

export default {
  data () {
    return {
      searchCandidats: undefined,
      selectedCandidat: undefined,
    }
  },

  computed: {
    candidats () {
      return this.$store.state.adminSearch.candidats.list
    },
  },

  watch: {
    searchCandidats (searchQuery) {
      this.$store.dispatch(FETCH_SEARCH_CANDIDATS_REQUEST, searchQuery)
    },
    selectedCandidat (selectedCandidat) {
      this.$emit('selection', selectedCandidat)
    },
  },
}

</script>
