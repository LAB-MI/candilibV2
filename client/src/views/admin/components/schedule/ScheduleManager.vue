<template>
  <div>
    <v-card>
      <page-title title="Gestion planning" />
    </v-card>
    <schedule-inspector />
  </div>
</template>

<script>
import { mapState } from 'vuex'

import ScheduleInspector from './ScheduleInspector'

export default {
  components: {
    ScheduleInspector,
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
  flex: 0 1 40%;
}

</style>
