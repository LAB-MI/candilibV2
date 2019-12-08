<template>
  <div>
    <h2 class="text--center">
      Import places
    </h2>
    <upload-file
      subtitle="Les places en CSV"
      upload-label="Import"
      :import-disabled="inputDisabled"
      :file="file"
      accept=".csv, .xlsx"
      @select-file="fileSelected"
      @upload-file="uploadPlaces"
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
      const departement = this.$store.state.admin.departements.active
      await this.$store.dispatch(UPLOAD_PLACES_REQUEST, { file, departement })
      const { importPlaces } = this.$store.state
      if (importPlaces.lastFile !== undefined) {
        this.file = importPlaces.lastFile
      }
    },
  },
}
</script>
