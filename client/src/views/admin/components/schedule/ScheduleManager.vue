<template>
  <div>
    <page-title title="Gestion planning"/>
    <v-card class="t-import-places">
      <v-switch
        v-model="isImportPlacesActive"
        :label="`Import places`"
      ></v-switch>
      <v-layout wrap v-show="isImportPlacesActive" class="u-flex--space-between">
        <admin-import-places class="import-places"/>
        <import-places-validation class="u-flex__item"/>
      </v-layout>
    </v-card>
    <schedule-inspector/>
  </div>
</template>

<script>
import AdminImportPlaces from '../AdminImportPlaces'
import ImportPlacesValidation from '../ImportPlacesValidation'
import ScheduleInspector from './ScheduleInspector'

export default {
  components: {
    AdminImportPlaces,
    ImportPlacesValidation,
    ScheduleInspector,
  },

  data () {
    return {
      isImportPlacesActive: false,
    }
  },
}
</script>

<style scoped>

.import-places {
  flex-grow: 0;
  flex-shrink: 1;
  flex-basis: 40%;
}

</style>
