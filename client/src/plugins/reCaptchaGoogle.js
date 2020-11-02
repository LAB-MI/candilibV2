import Vue from 'vue'
import { VueReCaptcha } from 'vue-recaptcha-v3'

Vue.use(VueReCaptcha, { siteKey: process.env.RECAPTCHA_SITE_KEY || '6Ld7YtwZAAAAAM_wYRBp4qdQQR9FfggZLie00Ubj' })
