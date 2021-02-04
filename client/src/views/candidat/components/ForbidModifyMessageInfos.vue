<template>
  <section data-nosnippet="true">
    <v-alert
      type="info"
      class="rounded-corner"
    >
      <p data-nosnippet="true">
        <strong>
          En raison du succès de Candilib, vous êtes de plus en plus nombreux à être en attente d’une réservation de place d’examen.
          Nous avons constaté que la fonction "modification d’une place d’examen" était détournée au profit de certains.
          C’est pourquoi, par souci d’équité la fonctionnalité de modification d’une place d’examen a été supprimée afin de contrer les réservations automatisées.
          Si la date réservée ne vous convient plus, vous devez annuler votre réservation avant de pouvoir réserver de nouveau sur le site.
        </strong>
        <br>
      </p>
    </v-alert>
  </section>
</template>

<script>

export default {
  name: 'ForbidModifyMessageInfos',
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
