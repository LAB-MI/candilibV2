<template>
  <v-toolbar class="header-admin" dark fixed>
    <v-toolbar-title>
      <h1 class="logo">
        <router-link to="/admin" class="home-link">C<span class="col-red">A</span>NDILIB</router-link>
      </h1>
    </v-toolbar-title>
    <v-spacer></v-spacer>
    <h3 class="color-header" >{{ email && email.split('@')[0] }}</h3>
    <v-spacer></v-spacer>
    <div class="text-xs-center d-flex align-center">
      <header-icon
        v-for="icon in headerIcons"
        :key="icon.iconName"
        :routerTo="icon.routerTo"
        :iconName="icon.iconName"
        :tooltipText="icon.tooltipText"
      />
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
      <departement-selector
        class="departement-selector"
      />
      <bandeau-beta class="beta-relative"/>
    </div>
  </v-toolbar>
</template>

<script>
import { SIGN_OUT_ADMIN } from '@/store'
import DepartementSelector from '@/views/admin/components/DepartementSelector'
import HeaderIcon from '@/components/HeaderIcon'

export default {
  name: 'admin-header',
  components: {
    DepartementSelector,
    HeaderIcon,
  },

  props: {
    email: String,
    headerIcons: Array,
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
  display: flex;
  padding: 0 1em;
  background-color: black;
  margin-top: 4em;
}

.color-header {
  color: #fff;
}

.header-admin {
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
    font-size: 0.8em;
    position: relative;
    top: -0.1em;
  }
}
</style>
