<template>
  <v-container
    class="admin  admin-wrapper  u-flex  u-flex--column"
  >
    <admin-header :email="admin.email" :header-icons="headerIcons" />
    <main role="main" class="u-flex__item--grow" :style="{margin: '3em 0 0 0'}">
      <router-view />
    </main>
    <admin-footer />
  </v-container>
</template>

<script>
import { mapState } from 'vuex'
import { ROUTE_AUTHORIZE_AURIGE } from '../../constants'
import AdminHeader from './components/AdminHeader.vue'
import AdminFooter from './components/AdminFooter.vue'

const components = {
  AdminHeader,
  AdminFooter,
}

const headerIcons = [
  {
    routerTo: 'gestion-planning',
    iconName: 'calendar_today',
    tooltipText: 'Gestion planning',
  },
  {
    routerTo: ROUTE_AUTHORIZE_AURIGE,
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
    }
  },

  computed: {
    ...mapState(['admin']),
    headerIcons () {
      return headerIcons.filter(headerIcon => {
        return headerIcon.routerTo !== this.$store.getters.noAuthorize
      })
    },
  },
}
</script>

<style lang="stylus" scoped>
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
