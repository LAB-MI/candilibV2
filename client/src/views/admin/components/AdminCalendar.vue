<template>
  <div>
    <!-- TODO: en attente de spécification de resultat d'import place dans le calendrier by Baudoin -->
    <page-title
      v-show="false"
      title="Calendrier"
    />
    <simple-calendar
      v-show="false"
      :places="places"
    />
    <admin-import-places />
    <import-places-validation />
  </div>
</template>

<script>
import SimpleCalendar from './SimpleCalendar'
import AdminImportPlaces from './AdminImportPlaces.vue'
import ImportPlacesValidation from './ImportPlacesValidation.vue'

export default {
  name: 'AdminCalendar',
  components: {
    AdminImportPlaces,
    ImportPlacesValidation,
    SimpleCalendar,
  },

  data () {
    return {
      places: [
      ],
    }
  },

  mounted () {
  },
}
</script>
