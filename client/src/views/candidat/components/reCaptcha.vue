<template>
  <button @click="recaptcha">
    Execute recaptcha
  </button>
</template>

<script>
import Vue from 'vue'
import { VueReCaptcha } from 'vue-recaptcha-v3'

// For more options see below
Vue.use(VueReCaptcha, { siteKey: '6LdBKNUZAAAAADsERd8aXNxbYgWYM9GUY-V4pic-' })

export default {
  methods: {
    async recaptcha () {
      // (optional) Wait until recaptcha has been loaded.
      await this.$recaptchaLoaded()

      // Execute reCAPTCHA with action "login".
      //   const token = await this.$recaptcha('login')

      // Do stuff with the received token.
    },
  },
}

</script>
