<template>
  <vue-drag-resize
    :is-active="false"
    :is-draggable="true"
    :parent-limitation="false"
    :aspect-ratio="false"
    :w="200"
    :h="200"
    :x="axeX"
    :y="axeY"
    @resizing="resize"
    @dragging="resize"
  >
    <!-- <p>{{ top }} х {{ left }} </p>
    <p>{{ width }} х {{ height }}</p> -->

    <slot />
  </vue-drag-resize>
</template>

<script>
import VueDragResize from 'vue-drag-resize'

export default {
  name: 'WrapperDragResize',

  components: {
    VueDragResize,
  },

  props: {
    axeX: {
      type: Number,
      default: 0,
    },
    axeY: {
      type: Number,
      default: 0,
    },
  },

  data () {
    return {
      width: 0,
      height: 0,
      top: 0,
      left: 0,
    }
  },

  methods: {
    resize (newRect) {
      this.width = newRect.width
      this.height = newRect.height
      this.top = newRect.top
      this.left = newRect.left
    },
  },
}
</script>
