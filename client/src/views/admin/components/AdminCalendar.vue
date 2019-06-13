<template>
  <div>
    <!-- TODO: En attente de spécification de resultat d'import place dans le calendrier by Baudoin -->
    <page-title  v-show="false" :title="'Calendrier'"/>
    <simple-calendar v-show="false" :places="places" />
    <admin-import-places/>
    <import-places-validation/>
  </div>
</template>

<script>
import SimpleCalendar from './SimpleCalendar'
import AdminImportPlaces from './AdminImportPlaces.vue'
import ImportPlacesValidation from './ImportPlacesValidation.vue'
import { getFrenchLuxonCurrentDate } from '@/util/frenchDateTime.js'

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
          start: getFrenchLuxonCurrentDate().set({ hour: 9, minute: 0 }),
          duration: [30, 'minutes'],
        },
      ],
    }
  },

  mounted () {
  },
}
</script>
