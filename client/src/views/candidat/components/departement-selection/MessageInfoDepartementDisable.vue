<template>
  <v-alert
    type="warning"
    class="rounded-corner t-info-disable-departement"
  >
    <div v-html="message" />
  </v-alert>
</template>

<script>
import { DEPARTEMENT_HAVE_DISABLE_DATE } from '../faq/FaqJson'

export default {
  name: 'MessageInfoDepartementDisable',
  components: {
  },
  props: {
    homeDepartement: {
      type: String,
      required: true,
    },
    disableDate: {
      type: String,
      required: true,
    },
  },
  computed: {
    message () {
      return DEPARTEMENT_HAVE_DISABLE_DATE(this.homeDepartement, this.disableDate)
    },
  },
}
</script>
