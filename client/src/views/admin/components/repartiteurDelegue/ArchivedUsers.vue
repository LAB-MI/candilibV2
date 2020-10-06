<template>
  <div class="u-max-width">
    <page-title :title="'Liste des répartiteurs/délégués Archivés'" />

    <users-list
      class="mt-4  mb-8"
      :users="users"
      :is-archived-users="true"
    />
  </div>
</template>

<script>
import { FETCH_ARCHIVED_USER_LIST_REQUEST } from '../../../../store'
import UsersList from './UsersList'

export default {
  name: 'ArchivedUsers',

  components: {
    UsersList,
  },

  computed: {
    users () {
      return (this.$store.state.users.archivedUsersList || []).map(user => (
        {
          ...user,
          departementsAsString: (user.departements || []).join(', '),
        }
      ))
    },
  },

  mounted () {
    this.$store.dispatch(FETCH_ARCHIVED_USER_LIST_REQUEST)
  },

}
</script>
