<template>
  <v-toolbar
    fixed
    dark
    class="u-max-width-parent  candidat-header"
  >
    <v-toolbar-side-icon
      class="u-only-on-mobile"
      @click="toggleDrawer"
    ></v-toolbar-side-icon>
    <v-toolbar-title>
      <h1 class="logo">
        <router-link to="/candidat" class="home-link  u-flex--inline  u-flex--center">C<span class="apprenti-letter  u-flex--inline  u-flex--center">A</span>NDILIB</router-link>
      </h1>
    </v-toolbar-title>
    <v-spacer></v-spacer>
    <div class="text-xs-center  u-flex  u-flex--center  u-full-height">
      <v-tabs
        class="u-only-on-desktop  u-full-height"
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
          :key="link.routerTo.name"
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
import { DISPLAY_NAV_DRAWER, SIGN_OUT_CANDIDAT } from '@/store'

import IconWithTooltip from '@/components/IconWithTooltip'

export default {
  name: 'candidat-header',
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
      await this.$store.dispatch(SIGN_OUT_CANDIDAT)
      this.$router.push({ name: 'candidat-presignup' })
    },
    toggleDrawer () {
      try {
        const currentDrawerState = this.$store.state.candidat.displayNavDrawer
        this.$store.dispatch(DISPLAY_NAV_DRAWER, !currentDrawerState)
      } catch (error) {
      }
    },
  },
}
</script>

<style lang="postcss" scoped>
.apprenti-letter {
  background-color: white;
  border-radius: 50%;
  width: 2.5rem;
  height: 2.5rem;
  font-size: 0.8em;
  color: #f82249;
}

.candidat-header {
  background-color: #169db2;
}

>>> .v-tabs__bar {
  height: 100%;
}

>>> .v-tabs__wrapper {
  height: 100%;
}

>>> .v-tabs__container {
  height: 100%;
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
