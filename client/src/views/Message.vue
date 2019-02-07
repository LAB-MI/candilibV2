<template>
  <div class="c-candidat-wrapper">
    <div class="c-candidat-message">
      <h1 class="c-candidat-message__title">
        CANDILIB
      </h1>
      <h2 class="c-candidat-message__subtitle">
        Réservez votre place d'examen
      </h2>
      <hr class="u-separator" />

      <router-view />

      <hr class="u-separator" />
      <div class="u-flex  u-flex--center  u-flex--space-between" style="width: 80%;">
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
      <div style="margin-top: 10px">
        <app-version/>
      </div>
    </div>
  </div>
</template>

<script>
import logoMI from '@/assets/images/logo_mi_40x50.png'
import logoLabMI from '@/assets/images/lab_100.png'
import logoSR from '@/assets/images/securite_routiere_70x27.png'
import AppVersion from '@/components/AppVersion.vue'

export default {
  components: {
    AppVersion,
  },

  data () {
    return {
      logoMI,
      logoSR,
      logoLabMI,
    }
  },
}
</script>
