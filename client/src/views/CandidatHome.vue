<template>
  <signup-form />
</template>

<script>
// @ is an alias to /src
import { SignupForm } from './candidat/components'
import { SIGNED_IN_AS_CANDIDAT } from '@/store'

export default {
  name: 'candidat-home',
  data () {
    return {
      SIGNED_IN_AS_CANDIDAT,
    }
  },
  components: {
    SignupForm,
  },
  computed: {
    signedIn () {
      return this.$store.state.auth.statusCandidat === SIGNED_IN_AS_CANDIDAT
    },
  },
}
</script>
