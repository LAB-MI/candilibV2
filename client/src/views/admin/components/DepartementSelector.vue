<template>
  <v-flex>
    <v-btn-toggle
      mandatory
      v-model="activeDepartement"
    >
      <v-btn
        flat
        v-for="departement in admin.departements.list"
        :key="departement"
      >
        {{ departement }}
      </v-btn>
   </v-btn-toggle>
  </v-flex>
</template>

<script>
import { mapState } from 'vuex'

import { SELECT_DEPARTEMENT, FETCH_ADMIN_INFO_REQUEST } from '@/store'

export default {
  computed: {
    ...mapState(['admin']),
    activeDepartement: {
      get () {
        return this.admin.departements.active
      },
      set (departement) {
        this.selectDepartement(departement)
      }
    }
  },

  methods: {
    selectDepartement (departement) {
      this.$store.dispatch(SELECT_DEPARTEMENT, departement)
    },
  },

  async mounted () {
    await this.$store.dispatch(FETCH_ADMIN_INFO_REQUEST)
  },
}
</script>

<style lang="scss" scoped>
  .v-btn {
    border: 1px solid transparent;
  }
  .v-btn--active {
    border: 1px solid red;
  }
  .v-btn-toggle .v-btn.v-btn--active:not(:last-child) {
    border-right: 1px solid red;
  }
  .v-btn-toggle .v-btn:not(:last-child) {
    border-right: 1px solid transparent;
  }
  .v-btn-toggle .v-btn:first-child {
    border-right: 1px solid transparent;
  }
</style>
