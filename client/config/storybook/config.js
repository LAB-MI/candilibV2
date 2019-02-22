/* eslint-disable import/no-extraneous-dependencies */
import { addDecorator, configure } from '@storybook/vue'
import { configureViewport } from '@storybook/addon-viewport'
import { setConsoleOptions } from '@storybook/addon-console'

import Vue from 'vue'
import Vuex from 'vuex'

import 'vuetify/dist/vuetify.css'

import '../../src/plugins/index'

setConsoleOptions({
  panelExclude: [],
})

configureViewport({
  defaultViewport: 'galaxys5',
})

Vue.use(Vuex)

addDecorator(() => ({
  template: '<v-app><story/></v-app>',
}))

const req = require.context('../../src/stories', true, /.stories.js$/)

function loadStories () {
  req.keys().forEach(filename => req(filename))
}

configure(loadStories, module)
