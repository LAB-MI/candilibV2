<template>
  <div class="u-flex  u-flex--center">
    <div :class="{transitional: true, 'transitional-signup': showSignup}">
      <transition name="fade">
        <login-form class="c-form-wrapper" v-if="!showSignup" />
        <signup-form class="c-form-wrapper" v-else />
      </transition>
    </div>
  </div>
</template>

<script>
import { SignupForm, LoginForm } from './'

export default {
  components: {
    SignupForm,
    LoginForm,
  },

  computed: {
    showSignup () {
      return this.$route.meta.showSignup
    },
  },
}
</script>

<style lang="postcss" scoped>
.transitional {
  position: relative;
  min-height: 100vh;
  width: 100vw;
  background-image: url(../../../assets/bg-presignup.jpg);
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;

  @media (max-width: 1170px) {
    background: linear-gradient(to bottom, #7579ff, #b224ef);
  }
  &-signup {
    height: 55em;
  }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}

.c-form-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  display: flex;
  justify-content: center;
  align-items: center;
}

.c-signup-form {
  max-width: 40em;

  @media (max-width: 1170px) {
    width: 20em;
  }
}
</style>
