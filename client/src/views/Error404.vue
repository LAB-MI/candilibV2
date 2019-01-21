<template>
  <div>
    Page introuvable
  </div>
</template>

<script>
import { DateTime } from 'luxon'

import SimpleCalendar from './SimpleCalendar'

export default {
  components: {
    SimpleCalendar,
  },

  data () {
    return {
      places: [
        {
          _id: 1,
          start: DateTime.local().set({ hour: 9, minute: 0 }),
          duration: [30, 'minutes'],
        },
      ],
    }
  },

  mounted () {
  },
}
</script>
