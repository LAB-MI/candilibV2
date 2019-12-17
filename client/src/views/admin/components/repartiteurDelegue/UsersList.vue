<template>
  <div class="users-list  text-uppercase">
    <v-data-table
      :headers="headers"
      :items="users"
      :items-per-page="5"
      class="elevation-1"
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
        { text: 'Email', value: 'email' },
        { text: 'Statut', value: 'status' },
        { text: 'Départements', value: 'departementsAsString' },
        { text: 'Actions', value: 'action', align: 'center' },
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

<style lang="stylus" scoped>
.users-list {
  margin-top: 2em;
  margin-bottom: 2em;
}
</style>
