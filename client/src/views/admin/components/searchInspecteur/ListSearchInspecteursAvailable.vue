<template>
  <div>
    <v-autocomplete
      v-model="select"
      :items="inspecteurs"
      :loading="isLoading"
      label="Inspecteur..."
      :readonly="!isEditing"
      item-text="text"
      item-value="value"
    />
  </div>
</template>

<script>
import { FETCH_GET_INSPECTEURS_AVAILABLE_REQUEST } from '@/store'
import { mapGetters } from 'vuex'
export default {
  props: {
    centre: {
      type: String,
      default: '',
    },
    date: {
      type: String,
      default: '',
    },
    isEditing: Boolean,
  },
  data () {
    return {
      search: null,
      select: undefined,
    }
  },
  computed: {
    ...mapGetters(['activeDepartement']),
    inspecteurs () {
      return this.$store.state.adminModifInspecteur.inspecteurs.list.map(inspecteur => {
        const { _id: value, prenom, nom, matricule } = inspecteur
        const text = prenom + nom + ' | ' + matricule
        return { value, text, inspecteur }
      })
    },
    isLoading () {
      return this.$store.state.adminModifInspecteur.inspecteurs.isFetching
    },
  },
  watch: {
    select (newValue, oldValue) {
      if (newValue !== oldValue) {
        const inspecteur = this.inspecteurs.find(elt => elt.value === newValue)
        this.$emit('select-inspecteur', inspecteur.inspecteur)
      }
    },
  },
  mounted () {
    this.getInspecteurs()
  },
  methods: {
    async getInspecteurs () {
      await this.$store.dispatch(FETCH_GET_INSPECTEURS_AVAILABLE_REQUEST, { departement: this.activeDepartement, centre: this.centre, date: this.date })
    },
  },
}
</script>
