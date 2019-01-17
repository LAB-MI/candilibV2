<template>
  <div class="admin">
    <v-container :style="{ maxWidth: '100vw', paddingLeft: 0, paddingRight: 0 }">
      <admin-header :ids="ids" :header-icons="headerIcons" />
      <div :style="{margin: '4em 0 0 0'}">
        <admin-calendar :id="ids.adminCalendar" />
        <candidats-list :id="ids.adminCandidats" />
        <admin-aurige :id="ids.adminAurige" />
        <whitelist :id="ids.adminWhitelist" />
      </div>
    </v-container>
  </div>
</template>

<script>
import { CHECK_TOKEN, SIGN_OUT, SIGNED_IN } from '@/store'
import AdminHeader from './components/AdminHeader.vue'
import AdminAurige from './components/Aurige.vue'
import Whitelist from './components/Whitelist.vue'
import AdminCalendar from './components/AdminCalendar.vue'
import CandidatsList from './components/CandidatsList.vue'

const components = {
  AdminHeader,
  AdminAurige,
  AdminCalendar,
  CandidatsList,
  Whitelist,
}

const ids = {
  adminCalendar: 'admin-calendar',
  adminCandidats: 'admin-candidats',
  adminAurige: 'admin-aurige',
  adminWhitelist: 'admin-whitelist',
}

const headerIcons = [
  {
    routerTo: '/admin/calendar',
    scrollToEl: `#${ids.adminCalendar}`,
    iconName: 'calendar_today',
    tooltipText: 'Calendrier',
  },
  {
    routerTo: '/admin/candidats',
    scrollToEl: `#${ids.adminCandidats}`,
    iconName: 'format_list_numbered',
    tooltipText: 'Liste des candidats',
  },
  {
    routerTo: '/admin/aurige',
    scrollToEl: `#${ids.adminAurige}`,
    iconName: 'import_export',
    tooltipText: 'Import / Export Aurige',
  },
  {
    routerTo: '/admin/whitelist',
    scrollToEl: `#${ids.adminWhitelist}`,
    iconName: 'favorite',
    tooltipText: 'Liste blanche',
  },
]

export default {
  components,

  data () {
    return {
      drawer: false,
      ids,
      file: undefined,
      headerIcons,
    }
  },

  computed: {
    authStatus () {
      return this.$store.state.auth.status
    },
  },

  methods: {
    async checkAuth () {
      await this.$store.dispatch(CHECK_TOKEN)
      if (this.authStatus !== SIGNED_IN) {
        this.$router.push(`/?nextPath=${this.$route.fullPath}`)
      }
    },

    async disconnect () {
      await this.$store.dispatch(SIGN_OUT)
      this.$router.push('/')
    },
  },

  mounted () {
    this.checkAuth()
  },
}
</script>
