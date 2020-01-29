<template>
  <div>
    <v-data-table
      :headers="headers"
      :items="users"
      :items-per-page="10"
      class="elevation-1  t-list-users"
    >
      <template v-slot:item.action="{ item }">
        <update-user
          :email="item.email"
          :default-status="item.status"
          :default-departements="item.departements"
        />
        <delete-user
          :email="item.email"
        />
      </template>
    </v-data-table>
  </div>
</template>

<script>
import { FETCH_USER_LIST_REQUEST } from '@/store'
import DeleteUser from './DeleteUser'
import UpdateUser from './UpdateUser'
export default {
  components: {
    DeleteUser,
    UpdateUser,
  },

  data () {
    return {
      headers: [
        { text: 'Adresse courriel', value: 'email', class: 'text-uppercase' },
        { text: 'Statut', value: 'status', class: 'text-uppercase' },
        { text: 'Départements', value: 'departementsAsString', class: 'text-uppercase' },
        { text: 'Actions', value: 'action', align: 'center', class: 'text-uppercase' },
      ],
      editedUser: {},
    }
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
