<template>
  <v-container
    class="admin  admin-wrapper  u-flex  u-flex--column"
  >
    <admin-header :header-icons="headerIcons" />
    <main role="main" class="u-flex__item--grow" :style="{margin: '3em 0 0 0'}">
      <router-view />
    </main>
    <admin-footer />
  </v-container>
</template>

<script>
import AdminHeader from './components/AdminHeader.vue'
import AdminFooter from './components/AdminFooter.vue'

const components = {
  AdminHeader,
  AdminFooter,
}

const headerIcons = [
  {
    routerTo: 'admin-calendar',
    iconName: 'calendar_today',
    tooltipText: 'Calendrier',
  },
  {
    routerTo: 'aurige',
    iconName: 'import_export',
    tooltipText: 'Import / Export Aurige',
  },
  {
    routerTo: 'whitelist',
    iconName: 'favorite',
    tooltipText: 'Liste blanche',
  },
]

export default {
  components,

  data () {
    return {
      drawer: false,
      file: undefined,
      headerIcons,
    }
  },

  computed: {
    authStatus () {
      return this.$store.state.auth.statusAdmin
    },
  },
}
</script>

<style lang="scss" scoped>
  .admin-container {
    padding-top: "40px";
  }

  .admin-wrapper {
    max-width: 100vw;
    min-height: 100%;
    padding-left: 0;
    padding-right: 0;
    padding-bottom: 0;
  }
</style>
