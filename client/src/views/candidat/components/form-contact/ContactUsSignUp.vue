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
  },
}
</script>
