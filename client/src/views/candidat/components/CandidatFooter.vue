<template>
  <v-footer
    dark
    height="auto"
  >
    <app-version/>
  </v-footer>
</template>

<script>
import AppVersion from '../../../components/AppVersion.vue'
export default {
  name: 'candidat-footer',
  components: {
    AppVersion,
  },
}
</script>
