<template>
  <v-toolbar dark fixed>
    <v-toolbar-title>
      <h1 class="logo">
        <router-link to="/admin" class="home-link">C<span class="col-red">A</span>NDILIB</router-link>
      </h1>
    </v-toolbar-title>
    <v-spacer></v-spacer>
    <div class="text-xs-center d-flex align-center">
      <header-icon
        :key="icon.routerTo"
        v-for="icon in headerIcons"
        :scrollToEl="icon.scrollToEl"
        :routerTo="icon.routerTo"
        :iconName="icon.iconName"
        :tooltipText="icon.tooltipText"
      />
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
import { SIGN_OUT } from '@/store'

import HeaderIcon from '@/components/HeaderIcon'

export default {
  components: {
    HeaderIcon,
  },

  props: {
    ids: Object,
    headerIcons: Array,
  },

  methods: {
    async disconnect () {
      await this.$store.dispatch(SIGN_OUT)
      this.$router.push({ name: 'admin-login' })
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
</style>
