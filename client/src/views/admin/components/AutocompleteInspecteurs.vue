<template>
  <v-autocomplete
    v-model="selectedInspecteur"
    label="Inspecteurs"
    hint="Chercher un inspecteur par son nom"
    append-outer-icon="search"
    placeholder="Dupond"
    :items="inspecteurs"
    :search-input.sync="autocompleteInspecteurs"
    return-object
    item-text="nom"
    item-value="_id"
  />
</template>

<script>
import { FETCH_AUTOCOMPLETE_INSPECTEURS_REQUEST } from '@/store'

export default {
  data () {
    return {
      autocompleteInspecteurs: undefined,
      selectedInspecteur: undefined,
    }
  },

  computed: {
    inspecteurs () {
      return this.$store.state.adminSearch.inspecteurs.list
    },

  },

  watch: {
    autocompleteInspecteurs (searchQuery) {
      this.$store.dispatch(FETCH_AUTOCOMPLETE_INSPECTEURS_REQUEST, searchQuery)
    },
    selectedInspecteur (selectedInspecteur) {
      this.$emit('selection', selectedInspecteur)
    },
  },
}
</script>
