<template>
  <span>
    <v-card-title primary-title>
      Groupe {{ Number(itemAction.status) + 1 }}
    </v-card-title>
    <v-card-text>
      Réservations: {{ itemAction.infos['R'] || 0 }}
    </v-card-text>
    <v-card-text>
      Modifications: {{ itemAction.infos['M'] || 0 }}
    </v-card-text>
    <v-card-text>
      Annulations: {{ itemAction.infos['A'] || 0 }}
    </v-card-text>
  </span>
</template>

<script>
export default {
  name: 'ActionDetailsByStatus',
  props: {
    itemAction: {
      type: Object,
      default: () => {},
    },
  },
}
</script>
