<template>
  <div class="import-file">
    <div class="import-file-action  import-file-action--file">
      <h4 class="import-file-subtitle">
        Fichier
      </h4>
      <input-file
        :dark="dark"
        title="Choisir un fichier..."
        :selected-callback="fileSelected"
        :filename="filename"
        :accept="accept"
      />
    </div>
    <div class="import-file-action">
      <h4 class="import-file-subtitle">
        {{ subtitle }}
      </h4>
      <v-btn
        :dark="dark"
        color="#17a2b8"
        :disabled="importDisabled"
        :aria-disabled="importDisabled"
        @click="uploadFile"
      >
        {{ uploadLabel }}
      </v-btn>
    </div>
  </div>
</template>

<script>
import { InputFile } from '@/components'

export default {
  components: {
    InputFile,
  },
  props: {
    accept: {
      type: String,
      default: '',
    },
    subtitle: {
      type: String,
      default: '',
    },
    uploadLabel: {
      type: String,
      default: '',
    },
    onUpload: {
      type: Function,
      default () {},
    },
    selectFile: {
      type: Function,
      default () {},
    },
    dark: Boolean,
    importDisabled: Boolean,
    file: File,
  },

  data () {
    return {
      disabled: this.importDisabled,
    }
  },

  computed: {
    filename () {
      return this.file && this.file.name
    },
  },

  methods: {
    fileSelected (file) {
      this.$emit('select-file', file)
    },

    async uploadFile () {
      this.disabled = true
      const data = new FormData()
      data.append('file', this.file)
      this.$emit('upload-file', data)
    },
  },
}
</script>

<style lang="postcss" scoped>
.import-file {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1em 0;
  margin: 0 auto;

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
    flex-wrap: wrap;
    flex-grow: 1;
    flex-basis: 250px;
    flex-shrink: 0;

    &--file {
      flex-grow: 1;
    }
  }

  &-subtitle {
    text-transform: uppercase;
    font-size: 1.2em;
    overflow-wrap: normal;
  }
}

</style>
