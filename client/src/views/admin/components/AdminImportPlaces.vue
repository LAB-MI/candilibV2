<template>
  <div>
    <page-title :Title="'Import Places'"/>
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
import PageTitle from './PageTitle.vue'
import { SHOW_INFO, UPLOAD_PLACES_REQUEST } from '@/store'

export default {
  components: {
    PageTitle,
    UploadFile,
  },

  data () {
    return {
      file: undefined,
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
      const file = this.file
      this.file = null
      await this.$store.dispatch(UPLOAD_PLACES_REQUEST, file)
      const { importPlaces } = this.$store.state
      if (importPlaces.lastFile !== undefined) {
        this.file = importPlaces.lastFile
      }
    },
  },
}
</script>
