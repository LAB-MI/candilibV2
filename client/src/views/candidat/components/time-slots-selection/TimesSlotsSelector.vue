<template>
  <v-list>
    <v-list-group
      v-for="item in items"
      :key="item.day"
      v-model="item.active"
      :prepend-icon="item.action"
      no-action
    >
      <template v-slot:activator>
        <v-list-tile>
          <v-list-tile-content>
            <v-list-tile-title>{{ item.day }}</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </template>

        <v-container
          class="scroll-y"
        >
        <v-btn
          v-for="(subItem, i) in item.hours"
          :key="i"
          @click="selectSlot({ hour: subItem, day: item.day })"
        >
        {{ subItem }}
        </v-btn>
      </v-container>
    </v-list-group>
  </v-list>
</template>

<script>
import { DateTime } from 'luxon'

import { SELECT_DAY } from '@/store/time-slots'

export default {
  props: {
    items: {
      type: Array,
    },
  },
  methods: {
    selectSlot (slot) {
      if (!this.$store.state.center.selected) {
        return
      }
      const { nom, departement, _id } = this.$store.state.center.selected
      const day = slot.day.split(' ')
      const hour = slot.hour.split('-')[0].split('h')
      const dateFormat = DateTime.fromFormatExplain(`${day[2]} ${day[1]} ${day[3]}`, 'MMMM d yyyy', { locale: 'fr' }).result
      const dateIso = DateTime.local(dateFormat.year, dateFormat.month, dateFormat.day, parseInt(hour[0], 10), parseInt(hour[1], 10)).toISO()
      const selectedSlot = {
        slot: dateIso,
        centreInfo: {
          id: _id,
          nom,
          departement,
        },
      }
      this.$store.dispatch(SELECT_DAY, selectedSlot)
      this.$router.push({
        name: 'confirm-selection',
        params: {
          center: `${selectedSlot.centreInfo.departement}-${selectedSlot.centreInfo.nom}`,
          slot: selectedSlot.slot,
        },
      })
    },
  },
}
</script>
