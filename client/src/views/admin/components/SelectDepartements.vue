<template>
  <v-select
    v-model="departements"
    :dark="dark"
    :multiple="multiple"
    :items="availableDepartements"
    :label="label"
    prepend-icon="my_location"
    aria-placeholder="départements"
    :persistent-hint="persistentHint"
    :hint="hint"
    tabindex="0"
    :rules="departementsRules"
    required
    :readonly="readonly"
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
      default () {},
    },
    defaultDepartement: {
      type: String,
      default: '',
    },
    multiple: {
      type: Boolean,
      default: false,
    },
    hint: {
      type: String,
      default: '',
    },
    dark: {
      type: Boolean,
      default: false,
    },
    persistentHint: {
      type: Boolean,
      default: false,
    },
    label: {
      type: String,
      default: 'Départements',
    },
    readonly: {
      type: Boolean,
      default: false,
    },

  },

  data () {
    return {
      departements: this.defaultDepartements || this.defaultDepartement,
      departementsRules: [
        dpts => (!!dpts && !!dpts.length) ||
          'Veuillez renseigner au moins un département',
      ],
    }
  },
}
</script>
