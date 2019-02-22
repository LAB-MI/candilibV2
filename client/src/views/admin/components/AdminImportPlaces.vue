<template>
  <div>
    <h2>
      Import Places
    </h2>
    <upload-file
      subtitle="Les places en CSV"
      upload-label="Import"
      :import-disabled="inputDisabled"
      @select-file="fileSelected"
      :file="file"
      @upload-file="uploadPlaces"
    />

  </div>
</template>

<script>
import UploadFile from '@/components/UploadFile.vue'
import api from '@/api'

import { SHOW_INFO, SHOW_SUCCESS, SHOW_ERROR, SHOW_AURIGE_RESULT } from '@/store'

export default {
  components: {
    UploadFile,
  },

  data () {
    return {
      file: undefined,
      lastFile: undefined,
    }
  },

  computed: {
    inputDisabled () {
      return !this.file
    },
  },

  methods: {
    async fileSelected (file) {
      this.file = file
      const message = `Fichier ${file.name} prêt à être synchronisé`
      this.$store.dispatch(SHOW_INFO, message, 1000)
    },

    async uploadPlaces (data) {
      this.lastFile = this.file
      try {
        this.file = null
        const result = await api.admin.uploadPlacesCSV(data)
        if (result.success === false) {
          throw new Error(result.message)
        }
        this.$store.dispatch(SHOW_AURIGE_RESULT, result)
        this.$store.dispatch(SHOW_SUCCESS, result.message)
        this.lastFile = null
      } catch (error) {
        this.file = this.lastFile
        this.$store.dispatch(SHOW_ERROR, error.message)
      }
    },
  },
}
</script>
