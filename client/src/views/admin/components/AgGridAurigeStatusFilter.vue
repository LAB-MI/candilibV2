<template>
  <v-select v-model="selected" :items="options">
    <template slot="selection" slot-scope="{ item  }">
      <v-chip v-if="!item.value">
        <span >{{ item.text }}</span>
      </v-chip>
      <v-chip v-if="item.value">
        <v-icon>{{item.text}}</v-icon>
      </v-chip>
    </template>
    <template slot="item" slot-scope="{ item  }">
      <v-chip v-if="!item.value">
        <span >{{ item.text }}</span>
      </v-chip>
      <v-chip v-if="item.value">
        <v-icon>{{item.text}}</v-icon>
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
        { text: 'TOUS', value: '' },
        { text: 'done', value: 'success' },
        { text: 'clear', value: 'error' },
        { text: 'warning', value: 'warning' },
      ],
    }
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
  watch: {
    'selected': function (val, oldVal) {
      if (val !== oldVal) {
        this.params.filterChangedCallback()
      }
    },
  },
  created () {
    this.valueGetter = this.params.valueGetter
  },

})
</script>
