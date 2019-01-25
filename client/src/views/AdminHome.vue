<template>
  <Login />
</template>

<script>
// @ is an alias to /src
import Login from './admin/components/Login.vue'
import { CHECK_ADMIN_TOKEN, SIGNED_IN_AS_ADMIN } from '@/store'

export default {
  name: 'admin-home',
  components: {
    Login,
  },
}
</script>
