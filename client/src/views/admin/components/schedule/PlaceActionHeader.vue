<template>
  <h4>
    <strong>
      {{ candidat.prenom }}
      {{ candidat.nomNaissance }}
      {{ candidat.codeNeph }}
    </strong>
  </h4>
</template>

<script>
export default {
  props: {
    candidat: {
      type: Object,
      default () { return {} },
    },
  },
}
</script>

<style lang="stylus" scoped>
h4 {
  text-align: center;
}
</style>
