<template>
  <v-tooltip bottom fixed>
    <router-link class="d-block" slot="activator" :to="{ name: routerTo}">
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
    tooltipText: String,
  },
}
</script>
