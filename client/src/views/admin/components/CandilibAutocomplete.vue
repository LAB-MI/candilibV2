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
      :clearable="clearable"
      :autofocus="autofocus"
    />
  </div>
</template>

<script>
export default {

  props: {
    label: {
      type: String,
      default: '',
    },
    hint: {
      type: String,
      default: '',
    },
    placeholder: {
      type: String,
      default: '',
    },
    items: {
      type: Array,
      default () { return [{ text: 'Impossible', value: undefined }] },
    },
    itemText: {
      type: String,
      default: 'text',
    },
    itemValue: {
      type: String,
      default: 'value',
    },
    fetchAutocompleteAction: {
      type: String,
      default: '',
    },
    clearable: {
      type: Boolean,
      default: false,
    },
    autofocus: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    return {
      emptyList: undefined,
      searchInput: undefined,
      selected: undefined,
      timeoutId: undefined,
    }
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
