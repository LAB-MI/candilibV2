<template>
  <div class="u-flex  u-flex--center">
    <div class="transitional">
      <transition name="fade">
        <login-form class="c-login-form" v-if="!showSignup" :toggleForm="toggleForm" />
        <signup-form class="c-signup-form" v-else :toggleForm="toggleForm" />
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

  data () {
    return {
      showSignup: false,
    }
  },

  methods: {
    toggleForm () {
      this.showSignup = !this.showSignup
    },
  },
}
</script>

<style lang="postcss" scoped>
.transitional {
  position: relative;
  height: 100vh;
  width: 100vw;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 1s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}

.c-login-form {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 90%;
  max-width: 40em;
  transform: translate(-50%, -50%);

  @media (max-width: 1170px) {
    width: 20em;
  }
}

.c-signup-form {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 90%;
  max-width: 40em;
  transform: translate(-50%, -50%);

  @media (max-width: 1170px) {
    width: 20em;
  }
}
</style>
