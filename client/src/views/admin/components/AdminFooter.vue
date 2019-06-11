<template>
  <v-footer
    dark
    height="auto"
  >
    <admin-version/>
  </v-footer>
</template>

<script>
import AdminVersion from '../../../components/AppVersion.vue'
export default {
  name: 'admin-footer',
  components: {
    AdminVersion,
  },
}
</script>
