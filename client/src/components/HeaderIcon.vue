<template>
  <v-tooltip bottom fixed>
    <template v-slot:activator="{ on }">
      <router-link class="d-block" v-on="on" :to="{ name: routerTo}">
        <v-btn icon>
          <v-icon>{{iconName}}</v-icon>
        </v-btn>
      </router-link>
    </template>
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
