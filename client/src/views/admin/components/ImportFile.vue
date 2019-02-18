<template>
  <div class="import-file">
    <div class="import-file-action  import-file-action--file">
      <h4 class="import-file-subtitle">Fichier</h4>
      <input-file title="Choisir un fichier..." :selectedCallback="fileSelected" :filename="filename" />
    </div>
    <div class="import-file-action">
      <h4 class="import-file-subtitle">{{subtitle}}</h4>
      <v-btn :disabled="disabled" :aria-disabled="disabled" @click="uploadFile">{{uploadLabel}}</v-btn>
    </div>
  </div>
</template>

<script>
import { InputFile } from '@/components'
import { SHOW_INFO, SHOW_SUCCESS } from '@/store'

export default {
  components: {
    InputFile,
  },
  props: {
    subtitle: String,
    uploadLabel: String,
    uploadFunc: Function,
  },

  data () {
    return {
      file: undefined,
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
      const message = `Fichier ${file.name} prêt`
      this.$store.dispatch(SHOW_INFO, message, 1000)
    },

    async uploadFile () {
      const data = new FormData()
      data.append('file', this.file)
      const result = await this.uploadFunc(data)
      this.$store.dispatch(SHOW_SUCCESS, result.message)
      this.file = null
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
    }

  &-subtitle {
    text-transform: uppercase;
    font-size: 1.2em;
  }
}

</style>
