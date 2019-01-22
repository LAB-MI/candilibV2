<template>
  <div class="u-flex  u-flex--center">
    <div class="transitional">
      <transition name="fade">
        <login-form class="u-absolute  u-width-40em" v-if="!showSignup" :toggleForm="toggleForm" />
        <signup-form class="u-absolute  u-width-40em" v-else :toggleForm="toggleForm" />
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
}

.fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}

.u-width-40em {
  width: 40em;
  left: 0;
  transform: translateX(-50%)
}
</style>
