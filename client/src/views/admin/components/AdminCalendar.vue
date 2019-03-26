<template>
  <div>
    <page-title :Title="'Calendrier'"/>
    <simple-calendar :places="places" />
    <admin-import-places/>
    <import-places-validation/>
  </div>
</template>

<script>
import { DateTime } from 'luxon'

import SimpleCalendar from './SimpleCalendar'
import AdminImportPlaces from './AdminImportPlaces.vue'
import ImportPlacesValidation from './ImportPlacesValidation.vue'
import PageTitle from './PageTitle.vue'

export default {
  name: 'admin-calendar',
  components: {
    AdminImportPlaces,
    ImportPlacesValidation,
    PageTitle,
    SimpleCalendar,
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
