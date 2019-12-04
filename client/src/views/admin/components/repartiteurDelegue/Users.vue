<template>
  <div class="u-max-width">
    <page-title :title="'Liste des répartiteurs/délégués'"/>

    <user-create/>

    <v-divider></v-divider>

    <users-list/>
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
