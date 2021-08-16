<template>
  <section data-nosnippet="true">
    <v-alert
      type="warning"
      class="rounded-corner"
    >
      <p data-nosnippet="true">
        <strong>
          Attention : <br>
          Candilib est un service gratuit. <br>
          Candilib n'est présent sur aucun des réseaux sociaux. <br>
          Candilib ne propose aucune place en dehors de ce site. <br>
        </strong>
        <br>
      </p>
    </v-alert>
  </section>
</template>

<script>

export default {
  name: 'MessagePreventScam',
  components: {
  },
}
</script>

<style lang="stylus" scoped>
.link-color {
  color: white;
  text-decoration: underline;
}

.actions {
  display: grid;
  justify-content: center;
  grid-template-columns: auto auto;
  justify-items: center;
}
</style>
