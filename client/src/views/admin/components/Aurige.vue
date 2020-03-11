<template>
  <div
    :id="id"
    class="wrapper"
  >
    <page-title :title="'Interaction Aurige'" />
    <big-loading-indicator :is-loading="isLoading" />
    <div class="aurige">
      <!-- propager le accept for upload-file -->
      <upload-file
        class="u-flex__item--grow"
        dark
        subtitle="Synchronisation JSON"
        upload-label="Synchro"
        :import-disabled="inputDisabled"
        :file="file"
        accept=".json"
        @select-file="fileSelected"
        @upload-file="uploadCandidats"
      />
      <div class="aurige-action aurige-action--export">
        <h4 class="aurige-subtitle">
          Export CSV
        </h4>
        <v-btn
          color="#17a2b8"
          dark
          @click="getCandidatsAsCsv"
        >
          Export
        </v-btn>
      </div>
    </div>
    <aurige-validation />
  </div>
</template>

<script>
import { mapState } from 'vuex'

import api from '@/api'
import {
  downloadContent,
  getJsonFromFile,
} from '@/util'
import { SHOW_INFO, AURIGE_UPLOAD_CANDIDATS_REQUEST, SET_AURIGE_FEED_BACK } from '@/store'
import AurigeValidation from './AurigeValidation'
import UploadFile from '@/components/UploadFile.vue'
import { BigLoadingIndicator } from '@/components'
import { chunk } from 'lodash-es'

export default {
  name: 'AdminAurige',
  components: {
    AurigeValidation,
    UploadFile,
    BigLoadingIndicator,
  },

  props: {
    id: {
      type: String,
      default: 'aurige-vue-id',
    },
  },

  data () {
    return {
      file: undefined,
    }
  },

  computed: {
    ...mapState({
      departement: state => state.admin.departements.active,
      isLoading: state => state.aurige.isLoading,
    }),
    inputDisabled () {
      return !this.file
    },
  },

  mounted () {
    if (this.$route.hash.length) {
      this.$scrollTo(this.$route.hash)
    }
  },

  methods: {
    async fileSelected (file) {
      this.file = file
      const message = `Fichier ${file.name} prêt à être synchronisé`
      this.$store.dispatch(SHOW_INFO, message, 1000)
    },
    async uploadCandidats () {
      const file = this.file
      this.file = null
      const candidats = await getJsonFromFile(file)
      const divideArrayBy = 1000

      const files = chunk(candidats, divideArrayBy)
        .map((chunk, index) => {
          const builtFile = new File(
            [JSON.stringify(chunk)],
            `batchFileChunk_${index}`,
            { type: 'application/json' })
          return builtFile
        })

      const uploadResults = await files.reduce(async (acc, currentFile) => {
        return acc.then(async results => {
          try {
            await this.$store.dispatch(AURIGE_UPLOAD_CANDIDATS_REQUEST, currentFile)
            results.success = [
              ...results.success,
              ...this.$store.state.aurige.feedBack,
            ]
          } catch (error) {
            results.errors = [
              ...results.errors,
              error.message,
            ]
          }
          return results
        })
      }, Promise.resolve({ success: [], errors: [] }))

      this.$store.dispatch(SET_AURIGE_FEED_BACK, uploadResults)
    },
    async getCandidatsAsCsv () {
      const response = await api.admin.exportCsv(this.departement)
      downloadContent(response)
    },
  },
}
</script>

<style lang="postcss" scoped>
.wrapper {
  background-color: #3d4353;
}

.aurige {
  display: flex;
  color: #fff;
  justify-content: center;
  align-items: center;
  padding: 1em 0;
  margin: 0 auto;
  max-width: 1160px;

  @media (max-width: 1169px) {
    flex-direction: column;
  }

  &-action {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    padding: 1em;
    margin: 1em;
    flex-grow: 1;

    &--export {
      @media (max-width: 1169px) {
        border-top: 1px solid rgba(200, 200, 200, 0.3);
      }

      @media (min-width: 1170px) {
        border-left: 1px solid rgba(200, 200, 200, 0.3);
      }
    }
  }
}
</style>
