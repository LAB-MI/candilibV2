<template>
    <div>
        <v-btn block v-if="!isEditing"
         :loading="isLoading"
         @click="getInspecteurs()"
        >Modifier l'IPRC</v-btn>
        <v-autocomplete
        v-else
        v-model="select"
        :items="inspecteurs"
        :loading="isLoading"
        label="Inspecteur..."
        :readonly="!isEditing"
        item-text='text'
        item-value='value'
        >
        </v-autocomplete>
    </div>
</template>

<script>
import { FETCH_GET_INSPECTEURS_AVAILABLE_REQUEST } from '@/store'
export default {
  props: {
    centre: String,
    date: String,
  },
  data () {
    return {
      isEditing: false,
      search: null,
      select: undefined,
    }
  },
  computed: {
    inspecteurs () {
      return this.$store.state.adminModifIpcr.inspecteurs.list
    },
    isLoading () {
      return this.$store.state.adminModifIpcr.inspecteurs.isFetching
    },
  },
  watch: {
    select (newValue, oldValue) {
      console.log({ newValue, oldValue })
    },
  },
  methods: {
    async getInspecteurs () {
      await this.$store.dispatch(FETCH_GET_INSPECTEURS_AVAILABLE_REQUEST, { centre: this.centre, date: this.date })
      this.isEditing = true
    },
  },
}
</script>
