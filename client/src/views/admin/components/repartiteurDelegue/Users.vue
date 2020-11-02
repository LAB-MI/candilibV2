<template>
  <div class="u-max-width">
    <page-title :title="'Liste des répartiteurs/délégués'" />
    <user-create class="elevation-1  mt-4  white" />

    <users-list
      class="mt-4  mb-8"
      :users="users"
    />
  </div>
</template>

<script>
import UsersList from './UsersList'
import UserCreate from './UserCreate'
import { FETCH_USER_LIST_REQUEST } from '@/store'

export default {
  components: {
    UsersList,
    UserCreate,
  },

  computed: {
    users () {
      return (this.$store.state.users.list || []).map(user => (
        {
          ...user,
          departementsAsString: (user.departements || []).join(', '),
        }
      ))
    },
  },

  mounted () {
    this.$store.dispatch(FETCH_USER_LIST_REQUEST)
  },
}
</script>
