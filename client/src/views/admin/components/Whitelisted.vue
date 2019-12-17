<template>
  <v-list-item
    @click="() => {}"
  >
    <v-list-item-action v-if="whitelisted !== 'new'">
      <v-btn
        icon
        @click="$emit('delete', whitelisted)"
      >
        <v-icon color="#17a2b8">
          delete
        </v-icon>
      </v-btn>
    </v-list-item-action>

    <v-list-item-content>
      <v-list-item-title @dblclick="$emit('dblclick', whitelisted.email)">
        {{ whitelisted.email }}
      </v-list-item-title>
    </v-list-item-content>
  </v-list-item>
</template>

<script>
export default {
  name: 'Whitelisted',
  props: {
    whitelisted: {
      type: Object,
      default () {},
    },
  },

  data () {
    return {
      textToCopyToClipboard: '',
    }
  },
}
</script>
