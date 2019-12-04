<template>
  <v-select
    v-model="departements"
    class="t-select-departements"
    multiple
    :items="availableDepartements"
    label="Départements"
    prepend-icon="my_location"
    aria-placeholder="départements"
    hint="ex. : 93"
    tabindex="0"
    :rules="departementsRules"
    required
    @change="$emit('change-departements', departements)"
  />
</template>

<script>
export default {
  props: {
    availableDepartements: {
      type: Array,
      default () {
        return []
      },
    },
    defaultDepartements: {
      type: Array,
      default () {
        return []
      },
    },
  },

  data () {
    return {
      departements: this.defaultDepartements,
      departementsRules: [
        dpts => (!!dpts && !!dpts.length) ||
          'Veuillez renseigner au moins un département',
      ],
    }
  },
}
</script>
