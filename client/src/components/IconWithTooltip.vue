<template>
  <v-tooltip
    bottom
    fixed
  >
    <template v-slot:activator="{ on }">
      <v-btn
        icon
        v-on="on"
      >
        <v-icon>{{ iconName }}</v-icon>
      </v-btn>
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
    scrollToEl: {
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
