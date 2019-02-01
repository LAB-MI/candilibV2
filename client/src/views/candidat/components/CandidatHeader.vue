<template>
  <v-toolbar dark fixed class="u-max-width-parent">
    <v-toolbar-side-icon
      class="u-only-on-mobile"
      @click="toggleDrawer"
    ></v-toolbar-side-icon>
    <v-toolbar-title>
      <h1 class="logo">
        <router-link to="/candidat" class="home-link">C<span class="col-red">A</span>NDILIB</router-link>
      </h1>
    </v-toolbar-title>
    <v-spacer></v-spacer>
    <div class="text-xs-center d-flex align-center">
      <v-tabs
        class="u-only-on-desktop"
        slot="extension"
        v-model="activeTab"
        color="transparent"
        align-with-title
      >
        <v-tabs-slider color="#f82249"></v-tabs-slider>

        <v-tab
          v-for="link in links"
          :to="link.routerTo"
          :value="link.routerTo"
          :key="link.routerTo"
        >
          <icon-with-tooltip
            :iconName="link.iconName"
            :tooltipText="link.tooltipText"
          />
          <span class="min-width-1170">
            {{link.label}}
          </span>
        </v-tab>
      </v-tabs>
      <v-tooltip bottom>
        <v-btn icon @click.prevent="disconnect" slot="activator">
          <v-icon>exit_to_app</v-icon>
        </v-btn>
        <span>Déconnexion</span>
      </v-tooltip>
    </div>
  </v-toolbar>
</template>

<script>
import { DISPLAY_NAV_DRAWER, SIGN_OUT } from '@/store'

import IconWithTooltip from '@/components/IconWithTooltip'

export default {
  components: {
    IconWithTooltip,
  },

  props: {
    ids: Object,
    links: Array,
  },

  data () {
    return {
      activeTab: null,
    }
  },

  methods: {
    async disconnect () {
      await this.$store.dispatch(SIGN_OUT)
      this.$router.push({ name: 'admin-login' })
    },
    toggleDrawer () {
      const currentDrawerState = this.$store.state.candidat.displayNavDrawer
      this.$store.commit(DISPLAY_NAV_DRAWER, !currentDrawerState)
    },
  },
}
</script>

<style lang="postcss" scoped>
.admin-header {
  display: flex;
  padding: 0 1em;
  background-color: black;
  margin-top: 4em;
}

.logo {
  flex-grow: 1;
}

.home-link {
  color: #fff;
  font-weight: 600;
  text-decoration: none;
  letter-spacing: 0.1rem;
  font-size: 1em;
}

.min-width-1170 {
  @media (max-width: 1169px) {
    display: none;
  }
}
</style>
