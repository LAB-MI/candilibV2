<template>
  <div>
    <v-card class="t-import-places">
      <page-title title="Gestion planning" />

      <v-switch
        v-model="isImportPlacesActive"
        :label="`Import places`"
      />

      <div class="u-pr">
        <big-loading-indicator :is-loading="isPlacesUpdating" />

        <v-layout
          v-show="isImportPlacesActive"
          wrap
          class="u-flex--space-between  u-pr"
        >
          <admin-import-places class="import-places" />
          <import-places-validation class="u-flex__item" />
        </v-layout>
      </div>
    </v-card>
    <schedule-inspector />
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
