<template>
  <v-app>
    <v-content>
      <router-view/>
    </v-content>
    <app-snackbar />
  </v-app>
</template>

<script>
import { AppSnackbar } from '@/components'
export default {
  components: {
    AppSnackbar,
  },
}
</script>
