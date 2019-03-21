<template>
  <v-footer
    height="auto"
    class="footer  u-flex  u-flex--column"
  >
      <div class="footer--links  u-max-width  u-flex  u-flex--center  u-flex--space-between">
        <a href="https://www.interieur.gouv.fr/">
          <img :src="logoMI">
        </a>
        <a href="https://beta.interieur.gouv.fr/">
          <img :src="logoLabMI">
        </a>
        <a href="http://www.securite-routiere.gouv.fr/">
          <img :src="logoSR">
        </a>
      </div>
      <app-version class="white--text"/>
  </v-footer>
</template>

<script>
import logoMI from '@/assets/images/logo_mi_40x50.png'
import logoLabMI from '@/assets/images/lab_100.png'
import logoSR from '@/assets/images/securite_routiere_70x27.png'
import AppVersion from '@/components/AppVersion.vue'

export default {
  name: 'candidat-footer',
  components: {
    AppVersion,
  },
  data () {
    return {
      logoSR,
      logoMI,
      logoLabMI,
    }
  },
}
</script>

<style lang="scss" scoped>
.footer {
  padding-top: 1em;
  padding-bottom: 1em;
  background-color: #063852;

  &--links {
    width: 100%;
    padding: 0 2em;
  }
}

</style>
