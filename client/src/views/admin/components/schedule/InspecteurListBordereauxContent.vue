<template>
  <v-list-item @click="$emit('set-inspecteur-list', {isChecked, inspecteurId: inspecteur._id} )">
    <v-list-item-content @click.prevent="isChecked = !isChecked">
      <v-list-item-title>{{ inspecteur.nom }} - {{ inspecteur.matricule }} - {{ centre.nom }}</v-list-item-title>
    </v-list-item-content>
    <v-list-item-action>
      <v-checkbox
        v-model="isChecked"
        color="info"
      />
    </v-list-item-action>
  </v-list-item>
</template>

<script>
export default {
  props: {
    centre: {
      type: Object,
      default () {},
    },
    inspecteur: {
      type: Object,
      default () {},
    },
    inspecteurListToSendBordereaux: {
      type: Array,
      default () {},
    },
  },

  data () {
    return {
      isChecked: true,
    }
  },

  watch: {
    inspecteurListToSendBordereaux (newValue) {
      if (newValue.find(el => el === `${this.inspecteur._id}`)) {
        this.isChecked = true
        return
      }
      this.isChecked = false
    },
  },

  mounted () {
    this.$emit('set-inspecteur-list', { isChecked: this.isChecked, inspecteurId: this.inspecteur._id })
  },
}
</script>
