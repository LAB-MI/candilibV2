<template>
  <div class="u-max-width">
    <page-title :title="'Liste des utilisateur technique'" />
    <technical-user-create class="elevation-1  mt-4  white" />
    <!-- TODO: CREATE TECH USERS DATA-->
    <technical-users-list
      class="mt-4  mb-8"
      :technical-users="technicalUsers"
    />
  </div>
</template>

<script>
import { FETCH_TECHNICAL_USER_LIST_REQUEST } from '@/store'
import TechnicalUserCreate from './TechnicalUserCreate'
import TechnicalUsersList from './TechnicalUsersList'

export default {
  name: 'TechnicalUsers',
  components: {
    TechnicalUserCreate,
    TechnicalUsersList,
  },

  computed: {
    technicalUsers () {
      return (this.$store.state.technicalUser.list || []).map(user => (
        {
          ...user,
        }
      ))
    },
  },

  mounted () {
    this.$store.dispatch(FETCH_TECHNICAL_USER_LIST_REQUEST)
  },
}
</script>
