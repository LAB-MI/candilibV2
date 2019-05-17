import { storiesOf } from '@storybook/vue'
import Vuex from 'vuex'

import SheduleInspectorDialogContent from './SheduleInspectorDialogContent.vue'
import adminModifIpcsr from './searchInspecteur/ListSearchInspecteursAvailable.stories.store'
import admin from './SheduleInspectorDialogContent.stories.store'

storiesOf('Admin/ScheduleInspectorDialogContent', module)
  .add('booking', () => ({
    components: { SheduleInspectorDialogContent },
    template: `
        <shedule-inspector-dialog-content
            :closeDialog="closeDialog"
            :updateContent="updateContent"
            :flag-modal="flagModal"
            :icon="icon"
            :content="content"
            :selectedDate="selectedDate"
            :inspecteurId="inspecteurId" 
            :centreInfo="centreInfo" 
        />`,

    data () {
      return {
        flagModal: 'face',
        content: { place: undefined },
        icon: 'face',
        selectedDate: '2019-06-15',
        inspecteurId: 'inspecteur1',
        centreInfo: {
          _id: 'Centre1',
        },
      }
    },
    methods: {
      closeDialog () {
        alert('closeDialog')
      },
      updateContent () {
        alert('updateContent')
      },
    },
    store: new Vuex.Store({
      state: {

      },
      modules: {
        adminModifIpcsr,
        admin,
      },
    }),
  }))
