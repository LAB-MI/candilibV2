<template>
  <div class="admin">
    <v-container>
      <v-navigation-drawer
        v-model="drawer"
        absolute
        dark
        temporary
      >
      </v-navigation-drawer>
      <v-toolbar dark fixed>
        <v-toolbar-side-icon large @click.stop="drawer = !drawer"></v-toolbar-side-icon>
        <v-toolbar-title>
          <h1 class="logo">
            <router-link to="/admin" class="home-link">C<span class="col-red">A</span>NDILIB</router-link>
          </h1>
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <div class="text-xs-center d-flex align-center">
          <v-tooltip bottom>
            <v-btn icon slot="activator">
              <v-icon>calendar_today</v-icon>
            </v-btn>
            <span>Calendrier</span>
          </v-tooltip>
          <v-tooltip bottom>
            <v-btn icon slot="activator">
              <v-icon>format_list_numbered</v-icon>
            </v-btn>
            <span>Liste des candidats</span>
          </v-tooltip>
          <v-tooltip bottom>
            <v-btn icon slot="activator">
              <v-icon>import_export</v-icon>
            </v-btn>
            <span>Import/Export Aurige</span>
          </v-tooltip>
          <v-tooltip bottom>
            <v-btn icon slot="activator">
              <v-icon>favorite</v-icon>
            </v-btn>
            <span>Liste blanche</span>
          </v-tooltip>
        </div>
      </v-toolbar>
      <div :style="{margin: '4em 1em 1em 1em'}">
        <p>
          test 1
        </p>
        <p :style="{height: '200vh'}">
          test 2
        </p>
        <p id="admin-calendar">
          test 3
        </p>
        <p :style="{height: '200vh'}">
          test 4
        </p>
        <p>
          test 5
        </p>
      </div>
    </v-container>
  </div>
</template>

<script>
import { CHECK_TOKEN, SIGNED_IN } from '@/store'

export default {
  data () {
    return {
      drawer: false,
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
        this.$router.push(`/?nextPath=${this.$route.fullPath}&from=App`)
      }
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

.menu-burger {
  color: #fff
}

.home-link {
  color: #fff;
  font-weight: 600;
  text-decoration: none;
  letter-spacing: 0.1rem;
  font-size: 1em;
}
</style>
