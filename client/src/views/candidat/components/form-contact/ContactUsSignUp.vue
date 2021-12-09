<template>
  <div>
    <page-title>
      {{ $formatMessage({ id: 'contact_us_title' }) }}
    </page-title>
    <v-progress-circular
      v-if="isFetchingProfile"
      indeterminate
      color="primary"
    />

    <form-contact
      v-else
      :default-candidat="candidat"
      :available-deps="availableDeps"
      readonly
    />
  </div>
</template>

<script>
import FormContact from './FormContact'
export default {
  components: {
    FormContact,
  },
  computed: {
    availableDepartements () {
      const state = this.$store.state
      return state.departements && state.departements.list
    },
    isFetchingProfile () {
      return this.$store.state.candidat.isFetchingProfile
    },
    candidat () {
      const me = this.$store.state.candidat.me
      return me && {
        ...me,
        departement: me.homeDepartement,
      }
    },
    availableDeps () {
      if (this.availableDepartements.includes(this.candidat.departement)) {
        return this.availableDepartements
      }
      return [...this.availableDepartements, this.candidat.departement]
    },
  },
}
</script>
