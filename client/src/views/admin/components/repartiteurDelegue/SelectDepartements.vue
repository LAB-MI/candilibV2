<template>
  <v-select
    v-model="departements"
    class="t-select-departements"
    multiple
    :items="availableDepartements"
    label="Départements"
    prepend-icon="my_location"
    aria-placeholder="departements"
    hint="ex. : departements"
    tabindex="0"
    :rules="departementsRules"
    required
    @change="$emit('change-departements', departements)"
  />
</template>

<script>
import { mapState } from 'vuex'
export default {
  data () {
    return {
      departements: [],
      departementsRules: [
        dpts => (!!dpts && !!dpts.length) ||
          'Veuillez renseigner au moins un département',
      ],
    }
  },

  computed: {
    ...mapState({
      availableDepartements: state => state.admin.departements.list,
    }),
  },

  watch: {
    availableDepartements (departements) {
      this.departements = departements
      this.$emit('change-departements', departements)
    },
  },
}
</script>
