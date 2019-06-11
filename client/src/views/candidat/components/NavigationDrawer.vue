<template>
  <v-navigation-drawer
      v-model="drawer"
      dark
      absolute
      temporary
    >
      <v-list>
        <v-list-tile
          v-for="link in links"
          :key="link.routerTo.name"
          @click="to(link.routerTo)"
        >
          <v-list-tile-action>
            <v-icon>{{ link.iconName }}</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            {{link.label}}
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
</template>

<script>
import { DISPLAY_NAV_DRAWER } from '@/store'

export default {
  name: 'navigation-drawer',
  props: {
    links: Array,
  },

  computed: {
    drawer: {
      get () {
        return this.$store.state.candidat.displayNavDrawer
      },
      set (bool) {
        this.$store.dispatch(DISPLAY_NAV_DRAWER, bool)
      },
    },
  },

  methods: {
    to (to) {
      this.$router.push(to)
    },
  },
}
</script>
