<template>
  <div>
    <candidat v-if="signedIn" />
    <signup v-else />
  </div>
</template>

<script>
// @ is an alias to /src
import { Signup } from './candidat/components'
import Candidat from './candidat'
import { SIGNED_IN_AS_CANDIDAT } from '@/store'

export default {
  name: 'candidat-home',
  data () {
    return {
      SIGNED_IN_AS_CANDIDAT,
    }
  },
  components: {
    Signup,
    Candidat,
  },
  computed: {
    signedIn () {
      return this.$store.state.auth.statusCandidat === SIGNED_IN_AS_CANDIDAT
    },
  },
}
</script>
