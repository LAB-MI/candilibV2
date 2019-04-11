<template>
  <div class="hexagon-wrapper" @click="$emit('click', value)">
    <div
      class="icon"
      :class="{active}"
      v-html="hexagon"
    />
    <span class="inner-text">
      {{ value }}
    </span>
  </div>
</template>

<script>
import hexagon from '@/assets/images/hexagon.svg'

export default {
  props: {
    active: {
      type: Boolean,
      default: false,
      required: false,
    },
    value: String,
    click: Function,
  },
  data () {
    return {
      hexagon,
    }
  },
}
</script>

<style lang="scss" scoped>
.icon {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}

.hexagon-wrapper {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 2em;
  height: 2em;
  cursor: pointer;
}

.inner-text {
  z-index: 1;
}
</style>
