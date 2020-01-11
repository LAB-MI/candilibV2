<template>
  <div class="u-flex  u-flex--center  u-flex--v-start">
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
    <div class="u-flex  u-flex--center  u-flex--v-start">
      <v-checkbox
        v-model="startingWith"
        label="Commence par"
      />
      <v-checkbox
        v-model="endingWith"
        label="Finit par"
      />
    </div>
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
      default () { return [{ text: 'Veuillez taper au moins 3 caractères', value: undefined }] },
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
      startingWith: true,
      endingWith: true,
    }
  },

  watch: {
    searchInput (searchQuery) {
      const {
        startingWith,
        endingWith,
      } = this

      searchQuery = searchQuery.trim()
      if (!searchQuery || searchQuery.length < 3) {
        this.emptyList = []
        return
      }

      this.emptyList = undefined
      clearTimeout(this.timeoutId)
      this.timeoutId = setTimeout(() => {
        if (searchQuery && searchQuery.length > 2) {
          this.$store.dispatch(this.fetchAutocompleteAction, { search: searchQuery, startingWith, endingWith })
        }
      }, 300)
    },

    selected (selected) {
      this.$emit('selection', selected)
    },
  },
}
</script>
