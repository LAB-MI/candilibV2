<template>
  <h4>
    <strong>
      {{ candidat.prenom }}
      {{ candidat.nomNaissance }}
    </strong>
    <strong>
      {{ candidat.codeNeph }}
    </strong>
  </h4>
</template>

<script>
export default {
  props: {
    candidat: Object,
  },
}
</script>

<style lang="stylus" scoped>
h4 {
  text-align: center;
}
</style>
