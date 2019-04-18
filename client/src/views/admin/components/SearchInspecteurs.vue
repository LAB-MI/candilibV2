<template>
  <v-autocomplete
    v-model="selectedInspecteur"
    :label="label"
    :hint="hint"
    append-outer-icon="search"
    placeholder="Dupond"
    :items="inspecteurs"
    :search-input.sync="searchInspecteurs"
    return-object
    item-text="nom"
    item-value="_id"
  />
</template>

<script>
import { FETCH_SEARCH_INSPECTEURS_REQUEST } from '@/store'

export default {
  props: {
    label: String,
    hint: String,
  },

  data () {
    return {
      searchInspecteurs: undefined,
      selectedInspecteur: undefined,
    }
  },

  computed: {
    inspecteurs () {
      return this.$store.state.adminSearch.inspecteurs.list
    },

  },

  watch: {
    searchInspecteurs (searchQuery) {
      this.$store.dispatch(FETCH_SEARCH_INSPECTEURS_REQUEST, searchQuery)
    },
    selectedInspecteur (selectedInspecteur) {
      this.$emit('selection', selectedInspecteur)
    },
  },
}
</script>
