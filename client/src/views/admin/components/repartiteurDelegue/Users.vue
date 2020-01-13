<template>
  <div class="u-max-width">
    <page-title :title="'Liste des répartiteurs/délégués'" />

    <user-create class="elevation-1  mt-4  white" />

    <users-list class="mt-4  mb-8" />
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
