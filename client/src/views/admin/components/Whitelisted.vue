<template>
  <v-list-tile
    @click="() => {}"
  >
    <v-list-tile-action v-if="whitelisted !== 'new'">
      <v-btn icon @click="$emit('delete', whitelisted)">
        <v-icon color="#17a2b8">delete</v-icon>
      </v-btn>
    </v-list-tile-action>

    <v-list-tile-content>
      <v-list-tile-title>{{ whitelisted.email }}</v-list-tile-title>
    </v-list-tile-content>
  </v-list-tile>
</template>

<script>
export default {
  name: 'whitelisted',
  props: {
    whitelisted: Object,
  },

  data () {
    return {
      show: false,
    }
  },
}
</script>
