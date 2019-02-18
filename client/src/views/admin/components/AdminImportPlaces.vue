<template>
  <div :id="id">
    <h2>
      Import Places
    </h2>
    <import-file subtitle="Les places en CSV" uploadLabel="Import" :upload-func="uploadPlaces" />
  </div>
</template>

<script>
import importFile from './ImportFile.vue'
import api from '@/api'

export default {
  components: {
    importFile,
  },
  methods: {
    async uploadPlaces (data) {
      return api.admin.uploadPlacesCSV(data)
    },
  },
}
</script>
