
<template>
  <v-select
    v-model="status"
    class="t-select-status"
    :items="availableStatuses"
    label="Statut"
    prepend-icon="person"
    aria-placeholder="Répartiteur"
    hint="ex. : repartiteur"
    tabindex="0"
    required
    @change="$emit('change-status', status)"
  />
</template>

<script>

const defaultAvailableStatuses = [
  {
    value: 'repartiteur',
    text: 'Répartiteur',
  },
  {
    value: 'delegue',
    text: 'Délégué',
  },
]

export default {
  data () {
    return {
      availableStatuses: defaultAvailableStatuses,
      status: 'repartiteur',
      valid: false,
    }
  },
}
</script>
