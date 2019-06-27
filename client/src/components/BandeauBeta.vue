<template>
  <span :class="{fixed}">
    <img :src="beta" alt="Version bêta" class="beta" />
  </span>
</template>

<script>
import beta from '@/assets/images/beta.png'

export default {
  props: {
    fixed: Boolean,
  },
  data () {
    return {
      beta,
    }
  },
}
</script>

<style lang="stylus" scoped>
.fixed {
  position: fixed;
  top: 0;
  right: 0;
}

.beta {
  height: 4.2em;

  @media (max-width: 767px) {
    position: relative;
    top: 0.225em;
    height: 3.5em;
  }

  @media (max-width: 359px) {
    height: 3.5em;
  }
}

</style>
