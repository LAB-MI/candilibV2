<template>
  <div class="admin">
    <v-toolbar dark fixed>
      <v-toolbar-title>
        <h1 class="logo">
          <router-link to="/admin" class="home-link">C<span class="col-red">A</span>NDILIB</router-link>
        </h1>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-side-icon></v-toolbar-side-icon>
    </v-toolbar>
      <header class="admin-header">
      <button class="menu-burger">
        <v-icon dark large>menu</v-icon>
      </button>
    </header>
    <p :style="{height: '200vh'}">
      test
    </p>
  </div>
</template>

<script>
import { CHECK_TOKEN, SIGNED_IN } from '@/store'

export default {
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
  font-size: 1.1em;
}
</style>
