<template>
  <div
    :class="{'hexagon-wrapper': true, active}"
    @click="$emit('click', value)"
  >
    <hexagon
      class="icon"
      :class="{active}"
    />
    <span class="inner-text">
      {{ value }}
    </span>
  </div>
</template>

<script>
import Hexagon from '@/assets/images/hexagon.svg'

export default {
  name: 'CandilibHexagon',
  components: {
    Hexagon,
  },
  props: {
    active: {
      type: Boolean,
      default: false,
      required: false,
    },
    value: {
      type: String,
      default: '',
    },
    click: {
      type: Function,
      default () {},
    },
  },
}
</script>

<style scoped>
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
  width: 2.4em;
  height: 2.4em;
  cursor: pointer;
  color: #999;
  transition: color 0.5s ease-out;

  @media (max-width: 767px) {
    width: 2em;
    height: 2em;
  }

  &.active,
  &:hover {
    color: white;
  }
}

.inner-text {
  z-index: 1;
  font-size: 1.2em;
  font-weight: bold;
  padding-top: 0.25em;
}
</style>
