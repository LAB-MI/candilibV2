<template>
  <span>
    <img
      :src="beta"
      alt="Version bêta"
      class="beta"
      :class="{ fixed }"
    >
  </span>
</template>

<script>
import beta from '@/assets/images/beta.png'

export default {
  props: {
    fixed: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    return {
      beta,
    }
  },
}
</script>

<style lang="stylus" scoped>
.beta {
  height: 4.1em;
  position: relative;
  top: 0.125em;

  &.fixed {
    position: fixed;
    top: 0;
    right: 0;
  }

  @media (max-width: 959px) {
    top: 0.225em;
    height: 3.5em;
  }

  @media (max-width: 359px) {
    height: 3.5em;
  }
}

</style>
