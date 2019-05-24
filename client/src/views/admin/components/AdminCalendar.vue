<template>
  <div>
    <!-- TODO: en attante de specification de resulta d'import place dans le calendrier by Baudoin -->
    <page-title  v-show="false" :title="'Calendrier'"/>
    <simple-calendar v-show="false" :places="places" />
    <admin-import-places/>
    <import-places-validation/>
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
    AdminImportPlaces,
    ImportPlacesValidation,
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
