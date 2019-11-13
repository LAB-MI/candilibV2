<template>
  <div>
    <page-title :title="'Liste des répartiteurs/délégués'"/>
    <div>
      <user-create/>
    </div>
    <v-divider></v-divider>
    <div>
      <users-list/>
    </div>
  </div>
</template>

<script>
import UsersList from './UsersList'
import UserCreate from './UserCreate'

export default {
  components: {
    UsersList,
    UserCreate,
  },
}
</script>
