<template>
  <img :src="beta" alt="Version bêta" :class="{beta: true, absolute}" />
</template>

<script>
import beta from '@/assets/images/beta.png'

export default {
  props: {
    absolute: Boolean,
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
  height: 4.2em;

  &.absolute {
    position: absolute;
    top: 0;
    right: 0;
  }

  @media (max-width: 767px) {
    height: 4em;
  }
}

</style>
