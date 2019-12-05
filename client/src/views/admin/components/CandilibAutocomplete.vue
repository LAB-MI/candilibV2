<template>
  <div>
    <v-autocomplete
      v-model="selected"
      :label="label"
      :hint="hint"
      no-filter
      append-outer-icon="search"
      :placeholder="placeholder"
      :items="emptyList || items"
      :search-input.sync="searchInput"
      return-object
      :item-text="itemText"
      :item-value="itemValue"
      :clearable="clearable"
      :autofocus="autofocus"
    />
  </div>
</template>

<script>
export default {
  data () {
    return {
      emptyList: undefined,
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
    clearable: {
      type: Boolean,
      default: false,
    },
    autofocus: {
      type: Boolean,
      default: false,
    },
  },

  watch: {
    searchInput (searchQuery) {
      if (!searchQuery || searchQuery.length < 3) {
        this.emptyList = []
        return
      }
      this.emptyList = undefined
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
