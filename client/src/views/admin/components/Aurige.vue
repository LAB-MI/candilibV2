<template>
  <div :id="id" class="wrapper">
    <h2>
      Interaction Aurige
    </h2>
    <div class="aurige">
      <div class="aurige-action  aurige-action--file">
        <h4 class="aurige-subtitle">Fichier</h4>
        <input-file dark title="Choisir un fichier..." :selectedCallback="fileSelected" :filename="filename" />
      </div>
      <div class="aurige-action">
        <h4 class="aurige-subtitle">Synchronisation JSON</h4>
        <v-btn color="#17a2b8" dark :disabled="disabled" :aria-disabled="disabled" @click="uploadCandidats">Synchro</v-btn>
      </div>
      <div class="aurige-action  aurige-action--export">
        <h4 class="aurige-subtitle">Export CSV</h4>
        <v-btn color="#17a2b8" dark @click="getCandidatsAsCsv">Export</v-btn>
      </div>
    </div>
    <aurige-validation />
  </div>
</template>

<script>
import { InputFile } from '@/components'
import api from '@/api'
import { downloadContent } from '@/util'
import { SHOW_INFO, SHOW_SUCCESS, SHOW_AURIGE_RESULT } from '@/store'
import AurigeValidation from './AurigeValidation'

export default {
  components: {
    InputFile,
    AurigeValidation,
  },

  props: {
    id: String,
  },

  data () {
    return {
      file: undefined,
      lastFile: undefined,
    }
  },

  computed: {
    disabled () {
      return !this.file
    },

    filename () {
      return this.file && this.file.name
    },
  },

  methods: {
    async fileSelected (file) {
      this.file = file
      const message = `Fichier ${file.name} prêt à être synchronisé`
      this.$store.dispatch(SHOW_INFO, message, 1000)
    },

    async uploadCandidats () {
      const data = new FormData()
      this.lastFile = this.file
      data.append('file', this.file)
      try {
        this.file = null
        const result = await api.admin.uploadCandidatsJson(data)
        if (result.success === false) {
          throw new Error(result.message || 'Error in uploadCandidats at uploadCandidatsJson')
        }
        this.$store.dispatch(SHOW_AURIGE_RESULT, result)
        this.$store.dispatch(SHOW_SUCCESS, result.message)
        this.lastFile = null
      } catch (error) {
        this.file = this.lastFile
        throw new Error(error.message || 'Error in uploadCandidats at uploadCandidatsJson')
      }
    },

    async getCandidatsAsCsv () {
      const response = await api.admin.exportCsv()
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

  @media (max-width: 1170px) {
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

    &--file {
      flex-grow: 5;
    }

    &--export {
      @media (max-width: 1170px) {
        border-top: 1px solid rgba(200, 200, 200, 0.3);
      }

      @media (min-width: 1171px) {
        border-left: 1px solid rgba(200, 200, 200, 0.3);
      }
    }
  }

  &-subtitle {
    text-transform: uppercase;
    font-size: 1.2em;
  }
}
</style>
