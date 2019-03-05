<template>
  <div>
    <admin-import-places/>
    <import-places-validation/>
    <h2>
      Calendrier
    </h2>
    <simple-calendar :places="places" />
  </div>
</template>

<script>
import { DateTime } from 'luxon'

import SimpleCalendar from './SimpleCalendar'
import AdminImportPlaces from './AdminImportPlaces.vue'
import ImportPlacesValidation from './ImportPlacesValidation.vue'

export default {
  name: 'admin-calendar',
  components: {
    SimpleCalendar,
    AdminImportPlaces,
    ImportPlacesValidation,
  },

  data () {
    return {
      places: [
        {
          _id: 1,
          start: DateTime.local().set({ hour: 9, minute: 0 }),
          duration: [30, 'minutes'],
        },
      ],
    }
  },

  mounted () {
  },
}
</script>
