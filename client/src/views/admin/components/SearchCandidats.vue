<template>
  <v-autocomplete
    v-model="selectedCandidat"
    :label="label"
    :hint="hint"
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
  props: {
    label: String,
    hint: String,
  },

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
