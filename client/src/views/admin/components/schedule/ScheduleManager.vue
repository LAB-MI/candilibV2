<template>
  <div>
    <page-title title="Gestion planning"/>
    <v-card class="t-import-places">
      <v-switch
        v-model="isImportPlacesActive"
        :label="`Import places`"
      ></v-switch>
      <v-layout wrap v-show="isImportPlacesActive" class="u-flex--space-between">
        <big-loading-indicator :is-loading="isPlacesUpdating" />
        <admin-import-places class="import-places"/>
        <import-places-validation class="u-flex__item"/>
      </v-layout>
    </v-card>
    <schedule-inspector/>
  </div>
</template>

<script>
import { mapState } from 'vuex'

import AdminImportPlaces from '../AdminImportPlaces'
import ImportPlacesValidation from '../ImportPlacesValidation'
import ScheduleInspector from './ScheduleInspector'
import { BigLoadingIndicator } from '@/components'

export default {
  components: {
    AdminImportPlaces,
    ImportPlacesValidation,
    ScheduleInspector,
    BigLoadingIndicator,
  },

  data () {
    return {
      isImportPlacesActive: false,
    }
  },
  computed: {
    ...mapState({
      isPlacesUpdating: state => state.importPlaces.isPlacesUpdating,
    }),
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
