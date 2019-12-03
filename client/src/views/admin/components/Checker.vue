<template>
  <li>
    <v-icon small :class="{valid}">{{valid ? "check" : "close"}}</v-icon>
    <span :class="{valid}">{{text}}</span>
  </li>
</template>

<script>
export default {
  props: {
    valid: Boolean,
    text: String,
  },
}
</script>

<style lang="stylus" scoped>
.valid {
  color: green;
}
</style>
