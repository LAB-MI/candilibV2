<template>
  <v-toolbar dark fixed class="candidat-toolbar  u-max-width-parent">
    <v-toolbar-side-icon
      class="u-only-on-mobile"
      @click="toggleDrawer"
    ></v-toolbar-side-icon>
    <v-toolbar-title style="margin-left:0;">
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
        <v-btn
          class="t-disconnect"
          icon
          @click.prevent="disconnect"
          slot="activator"
       >
          <v-icon>exit_to_app</v-icon>
        </v-btn>
        <span>Déconnexion</span>
      </v-tooltip>
      <bandeau-beta class="beta-relative" />
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

<style lang="stylus" scoped>
.candidat-toolbar {
  justify-content: center;
  align-items: center;

  & >>> .v-toolbar__content {
    padding-right: 0;
  }
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

  @media (max-width: 359px) {
    font-size: 0.725em;
    position: relative;
    top: -0.1em;
  }
}

.min-width-1170 {
  @media (max-width: 1169px) {
    display: none;
  }
}
</style>
