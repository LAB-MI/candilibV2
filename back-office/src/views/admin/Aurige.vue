<template>
  <div :id="id" class="wrapper">
    <div class="aurige">
      <div class="aurige-action  aurige-action--file">
        <h4 class="aurige-subtitle">Fichier</h4>
        <input-file dark title="Choisir un fichier..." :selectedCallback="fileSelected" :filename="filename" />
      </div>
      <div class="aurige-action">
        <h4 class="aurige-subtitle">Synchronisation JSON</h4>
        <v-btn :disabled="disabled" :aria-disabled="disabled" @click="uploadCandidats">Synchro</v-btn>
      </div>
      <div class="aurige-action  aurige-action--export">
        <h4 class="aurige-subtitle">Export CSV</h4>
        <v-btn @click="getCandidatsAsCsv">Export</v-btn>
      </div>
    </div>
    <app-snackbar :snackbar="snackbar" :message="message" :onClose="onSnackbarClose" :timeout="1000" />
  </div>
</template>

<script>
import { AppSnackbar, InputFile } from '@/components'
import api from '@/api'
import { downloadContent } from '@/util'

export default {
  components: {
    AppSnackbar,
    InputFile,
  },

  props: {
    id: String,
  },

  data () {
    return {
      file: undefined,
      snackbar: false,
      message: 'Snackbar message',
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
      this.snackbar = true
      this.message = `Fichier ${file.name} prêt à être syncronisé`
    },

    async uploadCandidats () {
      const data = new FormData()
      data.append('file', this.file)
      const result = await api.uploadCandidatsJson(data)
      console.log(result.message)
      this.snackbar = true
      this.message = result.message
      this.file = null
    },

    async getCandidatsAsCsv () {
      const response = await api.exportCsv()
      downloadContent(response)
    },

    onSnackbarClose () {
      this.snackbar = false
    },
  },
}
</script>

<style lang="postcss" scoped>
.wrapper {
  background-color: #3D4353;
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
