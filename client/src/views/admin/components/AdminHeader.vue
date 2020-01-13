<template>
  <v-app-bar
    class="admin-header"
    dark
  >
    <v-toolbar-title class="u-flex__item--shrink-0">
      <h1 class="logo">
        <router-link
          to="/admin"
          class="home-link"
        >
          C<span class="col-red">A</span>NDILIB
        </router-link>
      </h1>
    </v-toolbar-title>

    <v-spacer />

    <h3 class="color-header">
      {{ email && email.split('@')[0] }}
    </h3>

    <v-spacer />

    <div class="text-xs-center d-flex align-center">
      <v-tabs
        slot="extension"
        v-model="activeTab"
        align-with-title
        class="px-0  mx-0"
      >
        <v-tabs-slider color="#f82249" />

        <v-tab
          v-for="icon in headerIcons"
          :key="icon.routerTo"
          :to="{name: icon.routerTo}"
          :value="icon.routerTo"
          class="no-margin-left  px-0  mx-0"
        >
          <v-tooltip
            bottom
            fixed
          >
            <template v-slot:activator="{ on }">
              <v-icon
                :class="`opaque-on-hover  px-0  mx-0  t-icon-header-${icon.routerTo}`"
                v-on="on"
              >
                {{ icon.iconName }}
              </v-icon>
            </template>
            <span>{{ icon.tooltipText }}</span>
          </v-tooltip>
        </v-tab>
      </v-tabs>

      <v-tooltip bottom>
        <template v-slot:activator="{ on: tooltip }">
          <v-btn
            class="t-disconnect"
            icon
            @click.prevent="disconnect"
            v-on="{ ...tooltip }"
          >
            <v-icon>exit_to_app</v-icon>
          </v-btn>
        </template>
        <span>Déconnexion</span>
      </v-tooltip>

      <departement-selector
        class="departement-selector"
      />

      <bandeau-beta class="beta-relative" />
    </div>
  </v-app-bar>
</template>

<script>
import { SIGN_OUT_ADMIN } from '@/store'
import DepartementSelector from '@/views/admin/components/DepartementSelector'

export default {
  name: 'AdminHeader',
  components: {
    DepartementSelector,
  },

  props: {
    email: {
      type: String,
      default: 'user@example.com',
    },
    headerIcons: {
      type: Array,
      default () {},
    },
  },

  data () {
    return {
      activeTab: '',
    }
  },

  methods: {
    async disconnect () {
      await this.$store.dispatch(SIGN_OUT_ADMIN)
      this.$router.push({ name: 'admin-login' })
    },
  },
}
</script>

<style lang="stylus" scoped>
.admin-header {
  position: sticky;
  top: 0;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  max-height: 64px;
  padding: 0 1em;
  background-color: black;

  & >>> .v-toolbar__content {
    padding-right: 0;
    width: 100%;
  }
}

.color-header {
  color: #fff;
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
    font-size: 0.8em;
    position: relative;
    top: -0.1em;
  }
}

>>> .theme--dark.v-tabs > .v-tabs-bar {
  background-color: transparent;
}

.no-margin-left {
  margin-left: 0 !important;
}

.opaque-on-hover:hover {
  color: #fff !important;
}
</style>
