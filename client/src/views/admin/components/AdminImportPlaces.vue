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
      accept=".csv"
    />

  </div>
</template>

<script>
import UploadFile from '@/components/UploadFile.vue'
import { SHOW_INFO, UPLOAD_PLACES_REQUEST } from '@/store'

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

    async uploadPlaces () {
      await this.$store.dispatch(UPLOAD_PLACES_REQUEST, this.file)
      const { importPlaces } = this.$store.state
      if (importPlaces.lastFile === undefined) {
        this.file = null
      } else {
        this.file = importPlaces.lastFile
      }
    },
  },
}
</script>
