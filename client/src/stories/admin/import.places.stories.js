import { storiesOf } from '@storybook/vue'
import { DateTime } from 'luxon'

import ImportPlacesValidation from '../../views/admin/components/ImportPlacesValidation.vue'
import AdminImportPlaces from '../../views/admin/components/AdminImportPlaces.vue'

import Vuex from 'vuex'

storiesOf('Admin Components/Import Places', module)
  .add('Upload Import Places', () => ({
    components: { AdminImportPlaces },
    store: new Vuex.Store({}),
    template: '<admin-import-places/>></admin-import-places>',
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
              date: DateTime.local().toISO(),
              message: 'test 1',
            },
            {
              status: 'success',
              centre: 'Centre test',
              date: DateTime.local().plus({ minutes: 30 }).toISO(),
              message: 'test 1',
            },
          ],
        },
      },
    }),
    template: '<import-places-validation/>',
  }))
