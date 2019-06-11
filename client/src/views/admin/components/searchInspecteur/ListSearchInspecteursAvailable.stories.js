import { storiesOf } from '@storybook/vue'
import Vuex from 'vuex'

import adminModifInspecteur from './ListSearchInspecteursAvailable.stories.store'
import ListSearchInspecteursAvailable from './ListSearchInspecteursAvailable.vue'

storiesOf('Admin/searchInspecteur', module)
  .add('ListSearchInspecteursAvailable', () => ({
    template: '<div><list-search-inspecteurs-available date="2019-06-15" centre="Centre1" @select-inspecteur="selectedInspecteur" /></div>',
    components: { ListSearchInspecteursAvailable },
    store: new Vuex.Store({
      state: { },
      modules: {
        adminModifInspecteur,
      },
    }),
    methods: {
      selectedInspecteur (inspecteur) {
        alert(inspecteur.nom)
      },
    },
  }))
