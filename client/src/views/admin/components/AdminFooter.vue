<template>
  <v-footer
    dark
    height="auto"
  >
    <admin-version />
  </v-footer>
</template>

<script>
import AdminVersion from '../../../components/AppVersion.vue'
export default {
  name: 'AdminFooter',
  components: {
    AdminVersion,
  },
}
</script>
