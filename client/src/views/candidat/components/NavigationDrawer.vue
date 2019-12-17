<template>
  <v-navigation-drawer
    v-model="drawer"
    dark
    absolute
    temporary
  >
    <v-list>
      <v-list-item
        v-for="link in links"
        :key="link.routerTo.name"
        @click="to(link.routerTo)"
      >
        <v-list-item-action>
          <v-icon>{{ link.iconName }}</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          {{ link.label }}
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
import { DISPLAY_NAV_DRAWER } from '@/store'

export default {
  name: 'NavigationDrawer',
  props: {
    links: {
      type: Array,
      default () {},
    },
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
