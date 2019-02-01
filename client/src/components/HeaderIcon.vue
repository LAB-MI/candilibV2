<template>
  <v-tooltip bottom fixed>
    <router-link class="d-block" slot="activator" v-scroll-to="scrollToEl || 'body'" :to="routerTo">
      <v-btn icon>
        <v-icon>{{iconName}}</v-icon>
      </v-btn>
    </router-link>
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
