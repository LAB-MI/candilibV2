<template>
<div>
  <v-autocomplete
    v-model="selected"
    :label="label"
    :hint="hint"
    no-filter
    append-outer-icon="search"
    :placeholder="placeholder"
    :items="items"
    :search-input.sync="searchInput"
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
      searchInput: undefined,
      selected: undefined,
      timeoutId: undefined,
    }
  },

  props: {
    label: String,
    hint: String,
    placeholder: String,
    items: Array,
    itemText: String,
    itemValue: String,
    fetchAutocompleteAction: String,
  },

  watch: {
    searchInput (searchQuery) {
      clearTimeout(this.timeoutId)
      this.timeoutId = setTimeout(() => {
        if (searchQuery && searchQuery.length > 2) {
          this.$store.dispatch(this.fetchAutocompleteAction, searchQuery)
        }
      }, 300)
    },
    selected (selected) {
      this.$emit('selection', selected)
    },
  },
}
</script>
