<template>
  <v-app-bar
    dark
    class="candidat-toolbar  u-max-width-parent"
  >
    <v-app-bar-nav-icon
      class="u-only-on-mobile"
      @click="toggleDrawer"
    />

    <v-toolbar-title style="margin-left: 0; padding-left: 0;">
      <h1 class="logo">
        <router-link
          to="/candidat"
          class="home-link"
        >
          C<span class="col-red">A</span>NDILIB
        </router-link>
      </h1>
    </v-toolbar-title>

    <v-spacer />

    <div class="text-xs-center d-flex align-center">
      <v-tabs
        slot="extension"
        v-model="activeTab"
        class="u-only-on-desktop"
        color="transparent"
        align-with-title
      >
        <v-tabs-slider color="#f82249" />

        <v-tab
          v-for="link in links"
          :key="link.routerTo.name"
          :to="link.routerTo"
          :value="link.routerTo"
          :class="`no-margin-left t-${link.routerTo.name}`"
        >
          <icon-with-tooltip
            :icon-name="link.iconName"
            :tooltip-text="link.tooltipText"
          />
          <span class="min-width-1170  tab-label">
            {{ link.label }}
          </span>
        </v-tab>
      </v-tabs>

      <v-tooltip
        v-if="isCandidatSignedIn"
        bottom
      >
        <template v-slot:activator="{ on }">
          <v-btn
            class="disconnect-btn  t-disconnect"
            icon
            @click.prevent="disconnect"
            v-on="on"
          >
            <v-icon>exit_to_app</v-icon>
          </v-btn>
        </template>
        <span>Déconnexion</span>
      </v-tooltip>
      <bandeau-beta />
    </div>
  </v-app-bar>
</template>

<script>
import { mapGetters } from 'vuex'
import { DISPLAY_NAV_DRAWER, SET_SHOW_EVALUATION, SIGN_OUT_CANDIDAT } from '@/store'
import IconWithTooltip from '@/components/IconWithTooltip'

export default {
  name: 'CandidatHeader',
  components: {
    IconWithTooltip,
  },

  props: {
    ids: {
      type: Object,
      default () {},
    },
    links: {
      type: Array,
      default () {},
    },
  },

  data () {
    return {
      activeTab: null,
      wantsToDisconnect: false,
    }
  },

  computed: {
    ...mapGetters([
      'isCandidatSignedIn',
    ]),
    showEvaluation () {
      return this.$store.state.candidat.showEvaluation
    },
  },

  watch: {
    async showEvaluation (newValue) {
      if (newValue === false && this.wantsToDisconnect === true) {
        await this.$store.dispatch(SIGN_OUT_CANDIDAT)
        this.$router.push({ name: 'candidat-presignup' })
      }
    },

    async wantsToDisconnect (newValue, oldValue) {
      if (newValue === true && !this.$store.state.candidat.me.isEvaluationDone) {
        await this.$store.dispatch(SET_SHOW_EVALUATION, true)
      } else {
        await this.$store.dispatch(SIGN_OUT_CANDIDAT)
        this.$router.push({ name: 'candidat-presignup' })
      }
    },
  },

  methods: {
    async disconnect () {
      this.wantsToDisconnect = true
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
  position: sticky;
  top: 0;
  z-index: 2;
  justify-content: center;
  align-items: center;

  & >>> .v-toolbar__content {
    padding-right: 0;
  }
}

.disconnect-btn {
  margin-left: 0;
  margin-right: 0;
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

>>> .no-margin-left {
  margin-left: 0 !important;
  padding-left: 0 !important;

  & .v-btn {
    margin-left: 0;
    margin-right: 0;
  }
}

.tab-label {
  color: white;
}

.min-width-1170 {
  @media (max-width: 1169px) {
    display: none;
  }
}
</style>
