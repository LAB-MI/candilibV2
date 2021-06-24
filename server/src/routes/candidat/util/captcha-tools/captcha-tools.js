import crypto from 'crypto'
import _ from 'lodash'

import { streamImages } from './merge-image'

export const visualCaptcha = {
  // Session namespace, used for filtering session data across multiple captchas
  namespace: 'visualcaptcha',

  // Object that will have a reference for the session object
  // It will have .visualCaptcha.images, .visualCaptcha.audios, .visualCaptcha.validImageOption, and .visualCaptcha.validAudioOption
  session: {},

  // All the image options.
  // These can be easily overwritten or extended using addImageOptions( <Array> ), or replaceImageOptions( <Array> )
  // By default, they're populated using the ./images.json file
  imageOptions: [],

  // Generate a new valid option
  // @param numberOfOptions is optional. Defaults to 5
  generate: function (numberOfOptions) {
    const visualCaptchaSession = this.session[this.namespace]
    const imageValues = []

    // Avoid the next IF failing if a string with a number is sent
    numberOfOptions = parseInt(numberOfOptions, 10)

    // If it's not a valid number, default to 5
    if (!numberOfOptions || !_.isNumber(numberOfOptions) || isNaN(numberOfOptions)) {
      numberOfOptions = 5
    }

    // Set the minimum numberOfOptions to four
    if (numberOfOptions < 4) {
      numberOfOptions = 4
    }

    // Shuffle all imageOptions
    this.imageOptions = _.shuffle(this.imageOptions)

    // Get a random sample of X images
    visualCaptchaSession.images = _.sampleSize(this.imageOptions, numberOfOptions)

    // Set a random value for each of the images, to be used in the frontend
    visualCaptchaSession.images.forEach(function (image, index) {
      var randomValue = crypto.randomBytes(20).toString('hex')

      imageValues.push(randomValue)
      visualCaptchaSession.images[index].value = randomValue
    })

    // Select a random image option, pluck current valid image option
    visualCaptchaSession.validImageOption = _.sample(
      _.without(visualCaptchaSession.images, visualCaptchaSession.validImageOption),
    )

    // Set random hashes for audio and image field names, and add it in the frontend data object
    visualCaptchaSession.frontendData = {
      values: imageValues,
      imageName: this.getValidImageOption().name,
      imageFieldName: crypto.randomBytes(20).toString('hex'),
      audioFieldName: crypto.randomBytes(20).toString('hex'),
    }
  },

  // Get data to be used by the frontend
  getFrontendData: function () {
    const visualCaptchaSession = this.session[this.namespace]
    const frontendData = visualCaptchaSession.frontendData

    return frontendData
  },

  // Get the current validImageOption
  getValidImageOption: function () {
    const visualCaptchaSession = this.session[this.namespace]

    return visualCaptchaSession.validImageOption
  },

  // Validate the sent image value with the validImageOption
  validateImage: function (sentOption) {
    return (sentOption === this.getValidImageOption().value)
  },

  // Return generated image options
  getImageOptions: function () {
    const generatedImageOptions = this.session[this.namespace].images

    return generatedImageOptions
  },

  // Return generated image option at index
  getImageOptionAtIndex: function (index) {
    const images = this.getImageOptions()
    const generatedImageOption = images && images[index]

    return generatedImageOption
  },

  // Return all the image options
  getAllImageOptions: function () {
    return this.imageOptions
  },
}

// @param session is the default session object
// @param defaultImages is optional. Defaults to the array inside ./images.json. The path is relative to ./images/
// @param defaultAudios is optional. Defaults to the array inside ./audios.json. The path is relative to ./audios/
export const captchaTools = function (session, namespace, defaultImages) {
  const captcha = {}

  // Throw an error if no session object is passed
  if (typeof session !== 'object' || !session) {
    const message = 'visualCaptchaException: Cannot initialize visualCaptcha without a valid session object!'
    throw new Error(message)
  }

  // Extend the visualCaptcha object
  _.extend(captcha, visualCaptcha)

  // If namespace is present, use it
  if (namespace && namespace.length !== 0) {
    captcha.namespace = 'visualcaptcha_' + namespace
  }

  // Attach the session object reference to visualCaptcha
  captcha.session = session

  // Start a new object that will hold visualCaptcha's data for the session
  captcha.session[captcha.namespace] = captcha.session[captcha.namespace] || {}

  // If there are no defaultImages, get them from ./images.json
  if (!defaultImages || defaultImages.length === 0) {
    defaultImages = require('./images.json')
  }

  // Attach the images object reference to visualCaptcha
  captcha.imageOptions = defaultImages

  // Get data images function
  captcha.streamImages = streamImages

  return captcha
}
