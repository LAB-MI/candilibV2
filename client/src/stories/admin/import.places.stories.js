import { storiesOf } from '@storybook/vue'

import message from '../../store/message'
import importPlaces from '../../store/import-places'
import ImportPlacesValidation from '../../views/admin/components/ImportPlacesValidation.vue'
import AdminImportPlaces from '../../views/admin/components/AdminImportPlaces.vue'

import Vuex, { mapState } from 'vuex'
import { getFrenchLuxonCurrentDateTime } from '@/util'

storiesOf('Admin/Import Places', module)
  .add('Upload Import Places', () => ({
    components: { AdminImportPlaces },
    computed: mapState({
      content: state => state.message.content,
      show: state => state.message.show,
      color: state => state.message.color,
    }),
    store: new Vuex.Store({
      modules: {
        message,
        importPlaces,
      },
    }),
    template: '<admin-import-places/>',
  }))
  .add('Result Import Places', () => ({
    components: { ImportPlacesValidation },
    store: new Vuex.Store({
      state: {
        importPlaces: {
          places: [
            {
              status: 'error',
              centre: 'Centre test',
              date: getFrenchLuxonCurrentDateTime().toISO(),
              message: 'test 1',
            },
            {
              status: 'success',
              centre: 'Centre test',
              date: getFrenchLuxonCurrentDateTime().plus({ minutes: 30 }).toISO(),
              message: 'test 1',
            },
          ],
        },
      },
    }),
    template: '<import-places-validation/>',
  }))
  .add('Upload and Result Import Places', () => ({
    components: {
      AdminImportPlaces,
      ImportPlacesValidation,
    },
    store: new Vuex.Store({
      state: {},
      modules: {
        message,
        importPlaces,
      },
    }),
    template: '<div><admin-import-places/> <import-places-validation/> </div>',
  }))
