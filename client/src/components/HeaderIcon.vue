<template>
  <v-tooltip
    bottom
    fixed
  >
    <template v-slot:activator="{ on }">
      <router-link
        class="d-block"
        :to="{ name: routerTo}"
        v-on="on"
      >
        <v-btn icon>
          <v-icon>{{ iconName }}</v-icon>
        </v-btn>
      </router-link>
    </template>
    <span>{{ tooltipText }}</span>
  </v-tooltip>
</template>

<script>
export default {
  props: {
    routerTo: {
      type: String,
      default: '',
    },
    iconName: {
      type: String,
      default: '',
    },
    tooltipText: {
      type: String,
      default: '',
    },
  },
}
</script>
