<template>
  <div
    v-show="isLoading"
    class="u-pa"
    style="top: 0; bottom: 0; left: 0; right: 0;"
  >
    <v-overlay
      color="white"
      absolute
      z-index="1"
    />
    <div
      class="loading-indicator"
    >
      <div class="loading-indicator-progress">
        <v-progress-circular
          indeterminate
          color="primary"
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    isLoading: {
      type: Boolean,
      default: false,
    },
  },
}
</script>

<style lang="stylus" scoped>
.loading-indicator {
  position: relative;
  width: 100%;
  height: 100%;
  z-index: 1;

  &-progress {
    position: absolute;
    width: 150px;
    height: 150px;
    top: 100px;
    left: 50%;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    background: #32a9bb55;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>
