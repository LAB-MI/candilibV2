<template>
  <v-tooltip bottom fixed>
    <v-btn icon slot="activator">
      <v-icon>{{iconName}}</v-icon>
    </v-btn>
    <span>{{tooltipText}}</span>
  </v-tooltip>
</template>

<script>
export default {
  props: {
    routerTo: String,
    iconName: String,
    scrollToEl: String,
    tooltipText: String,
  },
}
</script>
