/* eslint-disable import/no-extraneous-dependencies */
import { addDecorator, configure } from '@storybook/vue'
import { setConsoleOptions } from '@storybook/addon-console'

import Vue from 'vue'
import Vuex from 'vuex'
import Router from 'vue-router'
import VueIntl from 'vue-intl'
import 'vuetify/dist/vuetify.css'

import { candidat, admin } from '../../src/messages'
import '../../src/plugins/index'

import '../../src/main.styl'

Vue.use(VueIntl)
Vue.setLocale('fr')
Vue.registerMessages('fr', { ...candidat, ...admin })

Vue.use(Vuex)
Vue.use(Router)

setConsoleOptions({
  panelExclude: [],
})

addDecorator(() => ({
  template: '<v-app><story/></v-app>',
}))

const req = require.context('../../src', true, /.stories.js$/)

function loadStories () {
  req.keys().forEach(filename => req(filename))
}

configure(loadStories, module)
