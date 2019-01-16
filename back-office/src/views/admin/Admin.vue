<template>
  <div class="admin">
    <v-container :style="{ maxWidth: '100vw', paddingLeft: 0, paddingRight: 0 }">
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
      <div :style="{margin: '4em 0 0 0'}">
        <p :id="ids.adminCalendar">
          Calendrier en premier
        </p>
        <p :id="ids.adminCandidats">
          Liste des candidats inscrits (ou ayant réservé)
        </p>
        <admin-aurige :id="ids.adminAurige" />
        <p :id="ids.adminWhitelist">
          Liste blanche
        </p>
      </div>
    </v-container>
  </div>
</template>

<script>
import { CHECK_TOKEN, SIGN_OUT, SIGNED_IN } from '@/store'
import HeaderIcon from './HeaderIcon.vue'
import AdminAurige from './Aurige.vue'

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
  components: {
    HeaderIcon,
    AdminAurige,
  },

  data () {
    return {
      drawer: false,
      headerIcons,
      ids,
      file: undefined,
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
