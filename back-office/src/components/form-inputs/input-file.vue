<template>
  <div class="input-file-container">
    <input :id="this.inputId" type="file" @change="fileSelected">
    <label class="input-file-label" :for="this.inputId">
      <span :class="{ok: isFileSelected}">{{ label }}</span>
    </label>
  </div>
</template>

<script>
export default {
  name: 'upload-button',
  props: {
    selectedCallback: Function,
    title: String,
  },
  data () {
    return {
      inputId: this.key + '_' + Math.random().toString().substring(2),
      isFileSelected: false,
      label: this.title,
    }
  },
  methods: {
    fileSelected (e) {
      const file = e.target.files[0]
      this.label = file.name || this.title
      this.isFileSelected = !!file
      if (this.selectedCallback) {
        if (file) {
          this.selectedCallback(file)
        } else {
          this.selectedCallback(null)
        }
      }
    },
  },
}
</script>

<style lang="postcss" scoped>
.input-file-container {
  position: relative;
  display: inline-block;
  height: calc(2.25rem + 2px);
  margin-bottom: 0;
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
  color: #495057;
  background-color: #fff;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;

  &:after {
    content: 'Parcourir...';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    z-index: 3;
    display: block;
    height: 2.25rem;
    padding: 0.375rem 0.75rem;
    line-height: 1.5;
    color: #495057;
    background-color: #e9ecef;
    border-left: 1px solid #ced4da;
    border-radius: 0 0.25rem 0.25rem 0;
  }

}

.ok {
  color: #000;
}
</style>
