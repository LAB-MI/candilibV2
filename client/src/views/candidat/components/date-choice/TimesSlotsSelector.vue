<template>
  <v-list>
    <v-list-group
      v-for="item in items"
      :key="item.day"
      v-model="item.active"
      :prepend-icon="item.action"
      no-action
    >
      <template v-slot:activator>
        <v-list-tile>
          <v-list-tile-content>
            <v-list-tile-title>{{ item.day }}</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </template>

        <v-container
          style="max-height: 200px;"
          class="scroll-y"
        >
        <v-btn
          v-for="(subItem, i) in item.hours"
          :key="i"
          @click="() => {}"
        >
        {{ subItem }}
        </v-btn>
      </v-container>
    </v-list-group>
  </v-list>
</template>

<script>
export default {
  props: {
    items: {
      type: Array,
    },
  },
}
</script>
