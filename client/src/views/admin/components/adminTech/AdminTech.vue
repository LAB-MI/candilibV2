<template>
  <div>
    Admin Tech
    <button
      color="success"
      @click="getLogs()"
    >
      GET LOGS
    </button>
  </div>
</template>

<script>
import { FETCH_LOGS_REQUEST } from '@/store'

export default {
  name: 'AdminTech',
  methods: {
    getLogs () {
      this.$store.dispatch(FETCH_LOGS_REQUEST)
    },
  },
}
</script>
