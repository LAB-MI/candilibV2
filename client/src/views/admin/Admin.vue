<template>
  <v-container
    class="admin  admin-wrapper  u-flex  u-flex--column  u-full-height"
  >
    <admin-header
      :email="admin.email"
      :header-icons="headerIcons"
    />

    <main
      role="main"
      class="u-flex__item--grow"
      :style="{margin: '0.5em 0 0 0'}"
    >
      <router-view />
    </main>

    <admin-footer />
  </v-container>
</template>

<script>
import { mapState } from 'vuex'
import {
  ROUTE_AUTHORIZE_AURIGE,
  ROUTE_AUTHORIZE_STATS_KPI,
  ROUTE_AUTHORIZE_AGENTS,
  ROUTE_AUTHORIZE_CENTRES,
  ROUTE_AUTHORIZE_DEPARTEMENTS,
} from '@/constants'

import AdminHeader from './components/AdminHeader.vue'
import AdminFooter from './components/AdminFooter.vue'

import {
  FETCH_ADMIN_INFO_REQUEST,
} from '@/store'

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
    isProtected: true,
  },
  {
    routerTo: ROUTE_AUTHORIZE_STATS_KPI,
    iconName: 'bar_chart',
    tooltipText: 'Stats KPI',
    isProtected: true,
  },
  {
    routerTo: 'admin-candidat',
    iconName: 'face',
    tooltipText: 'Recherche Candidat',
  },
  {
    routerTo: ROUTE_AUTHORIZE_AGENTS,
    iconName: 'people_alt',
    tooltipText: 'Répartiteur/Délégué',
    isProtected: true,
  },
  {
    routerTo: ROUTE_AUTHORIZE_CENTRES,
    iconName: 'business',
    tooltipText: "Centres d'examens",
    isProtected: true,
  },
  {
    routerTo: ROUTE_AUTHORIZE_DEPARTEMENTS,
    iconName: 'location_searching',
    tooltipText: 'Départements',
    isProtected: true,
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
    ...mapState({
      admin: state => state.admin,
      headerIcons: state => headerIcons.filter(headerIcon => {
        return (state.admin.features && state.admin.features.includes(headerIcon.routerTo)) || !headerIcon.isProtected
      }),
    }),
  },
  async mounted () {
    await this.$store.dispatch(FETCH_ADMIN_INFO_REQUEST)
  },
}
</script>

<style lang="stylus" scoped>
  .admin-wrapper {
    max-width: 100vw;
    padding: 0;
  }
</style>
