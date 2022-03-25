<template>
  <v-data-table
    :headers="headers"
    :items="creneauCandidats"
    :items-per-page="-1"
  />
</template>

<script>
export default {
  props: {
    creneauCandidats: {
      type: Array,
      default () { return [] },
    },
  },

  data () {
    return {
      headers: [
        { text: ' ', value: 'hour' },
        { text: 'NEPH', value: 'candidat.codeNeph' },
        { text: 'Nom', value: 'candidat.nomNaissance' },
        { text: 'Prénom', value: 'candidat.prenom' },
        { text: 'Courriel', value: 'candidat.email' },
        { text: 'Portable', value: 'candidat.portable' },
        { text: 'resultat', value: 'reason' },
      ],
    }
  },

}
</script>
