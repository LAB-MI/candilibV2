
import config from '../config'
import axios from 'axios'

const recaptchaHttp = axios.create({
  baseURL: 'https://www.google.com',
})

const endpoints = {
  siteverify: 'recaptcha/api/siteverify',
}

export const apiRecaptcha = {
  // @see https://developers.google.com/recaptcha/docs/verify
  verify: response => {
    console.log({ response, configGOOGLE_RECAPTCHA_SECRET: config.GOOGLE_RECAPTCHA_SECRET })
    // @see https://stackoverflow.com/a/52416003
    return recaptchaHttp.post(
      `${endpoints.siteverify}?secret=${
        config.GOOGLE_RECAPTCHA_SECRET
      }&response=${response}`,
    )
  },
}
