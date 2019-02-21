<template>
  <div>
    <v-select v-model="selected" :items="options" item-text="text" item-value="value" >
      <template
            slot="selection"
            slot-scope="{ item  }"
          >
      <v-chip v-if="!item.value">
        <span >{{ item.text }}</span>
      </v-chip>
      <v-chip v-if="item.value">
        <v-icon>{{item.text}}</v-icon>
      </v-chip>
      </template>
    </v-select>
    </div>
</template>

<script>
import Vue from 'vue'
// import Vuetify from 'vuetify'
// import IconComponent from './IconComponent.vue'

export default Vue.extend({
  data () {
    return {
      text: '',
      valueGetter: null,
      param: null,
      selected: '',
      options: [
        { text: 'TOUS', value: '' },
        { text: 'done', value: 'success' },
        { text: 'clear', value: 'error' },
      ],
    }
  },
  methods: {
    isFilterActive () {
      const { selected } = this
      console.log({
        func: 'isFilterActive',
        selected,
      })
      return selected && selected.length > 0
    },

    doesFilterPass (params) {
      const { selected } = this
      console.log({
        func: 'doesFilterPass',
        selected,
        params,
        value: this.valueGetter(params.node),
      })
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
<style scoped>
</style>
