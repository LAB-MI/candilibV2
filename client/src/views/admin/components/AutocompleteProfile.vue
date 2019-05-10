<template>
<div>
  <v-autocomplete
    v-model="selectedProfile"
    :label="label"
    :hint="hint"
    append-outer-icon="search"
    :placeholder="placeholder"
    :items="itemsProfile"
    :search-input.sync="autocompleteProfile"
    return-object
    :item-text="itemText"
    :item-value="itemValue"
  />
</div>
</template>

<script>

export default {
  data () {
    return {
      autocompleteProfile: undefined,
      selectedProfile: undefined,
    }
  },

  props: {
    label: String,
    hint: String,
    placeholder: String,
    itemsProfile: Array,
    itemText: String,
    itemValue: String,
    fetchAutocompleteProfile: String,
  },

  watch: {
    autocompleteProfile (searchQuery) {
      this.$store.dispatch(this.fetchAutocompleteProfile, searchQuery)
    },

    selectedProfile (selectedProfile) {
      this.$emit('selection', selectedProfile)
    },
  },
}
</script>
