
<template>
  <v-select
    v-model="status"
    class="t-select-status"
    :items="availableStatuses"
    label="Statut"
    prepend-icon="person"
    aria-placeholder="Répartiteur"
    hint="ex. : Répartiteur"
    tabindex="0"
    required
    @change="$emit('change-status', status)"
  />
</template>

<script>

// TODO: Filtrer la list des statuts pour les délégués
const defaultAvailableStatuses = [
  {
    value: 'repartiteur',
    text: 'Répartiteur',
  },
]

export default {
  data () {
    return {
      status: 'repartiteur',
    }
  },

  computed: {
    userStatus () {
      return this.$store.state.admin.status
    },

    availableStatuses () {
      if (this.userStatus === 'admin') {
        return [
          {
            value: 'delegue',
            text: 'Délégué',
          },
          ...defaultAvailableStatuses,
        ]
      }

      return defaultAvailableStatuses
    },

  },
}
</script>
