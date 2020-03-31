<template>
  <v-select
    v-model="selected"
    class="t-ag-grid-filter-status"
    :items="options"
  >
    <v-icon
      slot="append"
      class="t-ag-grid-filter-status-icon"
    >
      arrow_drop_down
    </v-icon>
    <template
      slot="selection"
      slot-scope="{ item }"
    >
      <v-chip
        v-show="!item.value"
        :class="item.class"
      >
        <span>{{ item.text }}</span>
      </v-chip>
      <v-chip
        v-show="item.value"
        :class="item.class"
      >
        <v-icon>{{ item.text }}</v-icon>
      </v-chip>
    </template>
    <template
      slot="item"
      slot-scope="{ item }"
    >
      <v-chip
        v-show="!item.value"
        :class="item.class"
      >
        <span>{{ item.text }}</span>
      </v-chip>
      <v-chip
        v-show="item.value"
        :class="item.class"
      >
        <v-icon>{{ item.text }}</v-icon>
      </v-chip>
    </template>
  </v-select>
</template>

<script>
import Vue from 'vue'

export default Vue.extend({
  data () {
    return {
      valueGetter: null,
      selected: '',
      options: [
        { text: 'TOUS', value: '', class: 't-ag-grid-filter-all' },
        { text: 'done', value: 'success', class: 't-ag-grid-filter-success' },
        { text: 'clear', value: 'error', class: 't-ag-grid-filter-error' },
        { text: 'warning', value: 'warning', class: 't-ag-grid-filter-warning' },
      ],
    }
  },

  watch: {
    selected: function (val, oldVal) {
      if (val !== oldVal && this.params) {
        this.params.filterChangedCallback()
      }
    },
  },

  created () {
    this.valueGetter = this.params && this.params.valueGetter
  },

  methods: {
    isFilterActive () {
      const { selected } = this
      return selected && selected.length > 0
    },

    doesFilterPass (params) {
      const { selected } = this
      return !selected || !(selected[0].length > 0) || !selected.indexOf(this.valueGetter(params.node))
    },
  },

})
</script>
