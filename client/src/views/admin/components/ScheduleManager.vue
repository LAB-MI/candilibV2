<template>
  <div>
    <v-card>
      <v-switch
        v-model="isImportPlacesActive"
        :label="`Import places`"
      ></v-switch>
      <v-layout row wrap v-if="isImportPlacesActive">
        <v-flex xs3>
            <admin-import-places/>
        </v-flex>
        <v-spacer/>
        <v-flex xs6>
          <import-places-validation/>
        </v-flex>
      </v-layout>
    </v-card>
  </div>
</template>

<script>
import AdminImportPlaces from './AdminImportPlaces.vue'
import ImportPlacesValidation from './ImportPlacesValidation.vue'

export default {
  components: {
    AdminImportPlaces,
    ImportPlacesValidation,
  },
  data () {
    return {
      isImportPlacesActive: false,
    }
  },
}
</script>
