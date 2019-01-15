<template>
  <div class="input-file-container">
    {{ title }}
    <input type="file" v-on:change="fileSelected">
  </div>
</template>

<script>
export default {
  name: 'upload-button',
  props: {
    selectedCallback: Function,
    title: String,
  },
  methods: {
    fileSelected (e) {
      const file = e.target.files[0]
      console.log(file)
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

}
</style>
