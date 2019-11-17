<template>
  <v-list-tile @click="$emit('set-inspecteur-list', {isChecked, inspecteurId: inspecteur._id} )">
    <v-list-tile-content @click.prevent="isChecked = !isChecked">
      <v-list-tile-title>{{ inspecteur.nom }} - {{ inspecteur.matricule }} - {{ centre.nom }}</v-list-tile-title>
    </v-list-tile-content>
    <v-list-tile-action>
      <v-checkbox
        color="info"
        v-model="isChecked"
      ></v-checkbox>
    </v-list-tile-action>
  </v-list-tile>
</template>

<script>
export default {
  props: {
    centre: {
      type: Object,
    },
    inspecteur: {
      type: Object,
    },
    inspecteurListToSendBordereaux: {
      type: Array,
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
