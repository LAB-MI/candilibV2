<template>
  <div class="input-file-container">
    <input
      :id="inputId"
      :accept="accept"
      type="file"
      class="u-transparent"
      @change="fileSelected"
    >
    <label
      ref="label"
      class="input-file-label"
      :for="inputId"
    >
      <v-text-field
        :dark="dark"
        class="d-inline-block"
        :label="label"
        :placeholder="placeholder"
        :value="filename"
        aria-readonly
        readonly
        @focus="selectFile"
      />

      <span class="d-inline-block">
        <v-icon
          :dark="dark"
          large
          class="upload-icon"
        >file_upload</v-icon>
      </span>
    </label>
  </div>
</template>

<script>
export default {
  name: 'UploadButton',
  props: {
    accept: {
      type: String,
      default: '*',
    },
    dark: Boolean,
    selectedCallback: {
      type: Function,
      default () {},
    },
    title: {
      type: String,
      default: 'Chargement en cours...',
    },
    placeholder: {
      type: String,
      default: 'fichier.csv',
    },
    filename: {
      type: String,
      default: 'fichier.csv',
    },
  },
  data () {
    return {
      inputId: this.key + '_' + Math.random().toString().substring(2),
      label: this.title,
    }
  },
  methods: {
    selectFile () {
      setTimeout(() => this.$refs.label.click(), 200)
    },

    fileSelected (e) {
      const file = e.target.files[0]
      if (this.selectedCallback) {
        this.selectedCallback(file)
      }
    },
  },
}
</script>

<style lang="postcss" scoped>
.input-file-container {
  position: relative;
  display: inline-block;
  height: calc(4rem + 2px);
  margin-bottom: 0;
}

.upload-icon {
  cursor: pointer;

  &:hover {
    color: #17a2b8;
  }
}

.input-file-label {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  z-index: 1;
  height: calc(2.25rem + 2px);
  padding: 0.375rem 0.75rem;
  line-height: 1.5;
  width: 25em;

  &:hover .upload-icon {
    color: #17a2b8;
  }
}

.u-transparent {
  opacity: 0;
}
</style>
