<template>
  <v-container>
    <v-layout column wrap>
      <v-flex xs6>
        <page-title>Chargement planning des places</page-title>
        <upload-file
          subtitle="Les places en CSV"
          upload-label="Charger"
          :import-disabled="inputDisabled"
          @select-file="fileSelected"
          :file="file"
          @upload-file="uploadPlaces"
          accept=".csv"
        />
        <page-title>{{ $formatMessage({ id: 'gestion_des_plannings'}) }}</page-title>
      </v-flex>
    </v-layout>
    <v-layout row wrap>
      <v-flex xs6>
        <page-title title="Centres d'examen"/>
      </v-flex>
      <v-flex xs6>
        <page-title title="Choix date"/>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import UploadFile from '@/components/UploadFile.vue'

export default {
  components: {
    UploadFile,
  },
}
</script>
