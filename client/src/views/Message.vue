<template>
  <div class="c-candidat-wrapper">
    <bandeau-beta fixed />
    <div class="c-candidat-message">
      <h1
        class="c-candidat-message__title"
        v-html="$formatMessage({ id: 'app_html_title'})"
      />
      <h2 class="c-candidat-message__subtitle">
        {{ $formatMessage({ id: 'app_subtitle' }) }}
      </h2>
      <hr class="u-separator">

      <router-view />

      <hr class="u-separator">
      <div
        class="u-flex u-flex--center u-flex--space-between"
        style="width: 80%;"
      >
        <a href="https://www.interieur.gouv.fr/">
          <img :src="logoMI">
        </a>
        <a href="https://beta.interieur.gouv.fr/">
          <img :src="logoLabMI">
        </a>
        <a href="http://www.securite-routiere.gouv.fr/">
          <img
            style="width: 80px;"
            :src="logoSR"
          >
        </a>
      </div>
      <div style="margin-top: 10px;">
        <app-version />
      </div>
    </div>
  </div>
</template>

<script>
import logoMI from '@/assets/images/logo_mi_40x50.png'
import logoLabMI from '@/assets/images/lab_100.png'
import logoSR from '@/assets/images/logo_securite_routiere.png'
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
      lastErrorColor: undefined,
    }
  },

  mounted () {
    this.lastErrorColor = this.$vuetify.theme.error
    this.$vuetify.theme.error = '#891329'
  },

  destroyed () {
    this.$vuetify.theme.error = this.lastErrorColor
  },
}
</script>

<style lang="stylus" scoped>
.c-candidat-wrapper {
  position: relative;
  min-height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #555;

  @media (min-width: 600px) {
    background-image: url('../assets/bg-presignup.jpg');
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
  }
}

.c-candidat-message {
  display: flex;
  width: 40em;
  padding: 1em;
  margin: 1em;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(to bottom, #17a2b8, #063852);
  border-radius: 1em;
  box-shadow: 0.05em 0.1em 0.1em 0.3em #fff;
  color: #fff;

  &__title {
    margin: 0.2em 0;
    line-height: 1;
    font-family: 'Poppins-Regular', Arial, Helvetica, sans-serif;
    font-size: 40px;
    letter-spacing: 5px;
    color: #fff;
    text-align: center;
    text-transform: uppercase;
    text-shadow: 3px 3px 0 #000;
    text-shadow: 8px 8px 12px #333;
  }

  &__subtitle {
    padding: 5px 0 15px 0;
    line-height: 1;
    font-family: 'Poppins-Medium', Arial, Helvetica, sans-serif;
    font-size: 14px;
    color: #fff;
    letter-spacing: 3px;
    text-align: center;
    text-transform: uppercase;
    text-shadow: 8px 8px 12px #333;
  }
}
</style>
