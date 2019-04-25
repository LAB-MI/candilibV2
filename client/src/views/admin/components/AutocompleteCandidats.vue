<template>

  <v-autocomplete
    v-model="selectedCandidat"
    :label="label"
    :hint="hint"
    append-outer-icon="search"
    placeholder="Dupont"
    :items="candidats"
    :search-input.sync="autocompleteCandidats"
    return-object
    item-text="nomNaissance"
    item-value="_id"
  >
  </v-autocomplete>

</template>

<script>
import { FETCH_AUTOCOMPLETE_CANDIDATS_REQUEST } from '@/store'

export default {
  props: {
    label: String,
    hint: String,
  },

  data () {
    return {
      autocompleteCandidats: undefined,
      selectedCandidat: undefined,
    }
  },

  computed: {
    candidats () {
      return this.$store.state.adminSearch.candidats.list
    },
  },

  watch: {
    autocompleteCandidats (searchQuery) {
      this.$store.dispatch(FETCH_AUTOCOMPLETE_CANDIDATS_REQUEST, searchQuery)
    },
    selectedCandidat (selectedCandidat) {
      this.$emit('selection', selectedCandidat)
    },
  },
}
</script>
