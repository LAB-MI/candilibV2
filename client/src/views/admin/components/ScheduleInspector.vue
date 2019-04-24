<template>
  <v-container class="container" grid-list-md>
    <v-layout row wrap>
      <v-flex class="center-title" xs3>
        <page-title title="Centres d'examen"/>
      </v-flex>
      <v-spacer></v-spacer>
      <page-title :title="`semaine ${currentWeekNumber}`"/>
      <v-spacer></v-spacer>
      <v-flex class="date-selector" xs2>
        <page-title title="Choix date"/>
        <v-menu
          v-model="menu2"
          :close-on-content-click="false"
          :nudge-right="40"
          lazy
          transition="scale-transition"
          offset-y
          full-width
          max-width="290px"
          min-width="290px"
        >
          <template v-slot:activator="{ on }">
            <v-text-field
              v-model="computedDateFormatted"
              persistent-hint
              prepend-icon="event"
              readonly
              v-on="on"
            />
          </template>
          <v-date-picker v-model="date" no-title @input="menu2 = false"></v-date-picker>
        </v-menu>
      </v-flex>
      <v-flex>
        <v-tabs
          class="tabs"
          v-model="active"
          color="white"
          slider-color="red"
        >
          <v-tab
            v-for="element in placesByCentreList"
            :key="element.centre.nom"
            @click="centreSelector(element.centre._id)"
            ripple
          >
            {{ element.centre.nom }}
          </v-tab>
          <v-tab-item
            v-for="(item, idx) in placesByCentreList"
            :key="item.centre.nom + idx"
          >
            <v-data-table
              :headers="headers"
              :items="inspecteurs"
              class="elevation-1"
            >
              <template v-slot:items="props">
                <td>{{ props.item.nom }}</td>
                  <schedule-inspector-dialog
                    v-for="(crenau, indx) in props.item.crenaux"
                    :key="'crenaux' + indx"
                    :icon="'face'"
                  />
                    <!-- <v-icon>
                      {{ props.item.crenaux8h00 ? 'face' : 'not_interested' }}
                    </v-icon> -->
              </template>
            </v-data-table>
          </v-tab-item>
        </v-tabs>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { DateTime } from 'luxon'
import PageTitle from '@/components/PageTitle.vue'
import ScheduleInspectorDialog from './ScheduleInspectorDialog.vue'

const crenaux = [
  'Inspecteurs',
  '08h00',
  '08h30',
  '09h00',
  '09h30',
  '10h00',
  '10h30',
  '11h00',
  '11h30',
  '13h30',
  '14h00',
  '14h30',
  '15h00',
  '15h30',
]

const headers = Array(14).fill(true).map((item, index) => {
  return {
    text: `${crenaux[index]}`,
    align: 'center',
    sortable: false,
    value: `${crenaux[index]}`,
  }
})

// const inspecteurs_old = [
//     {
//     name: 'Inspecteur1',
//     crenaux: [
//       crenaux8h00: 1,
//       crenaux8h30: 1,
//       crenaux9h00: 0,
//       crenaux9h30: 0,
//       crenaux10h00: 0,
//       crenaux10h30: 0,
//       crenaux11h00: 0,
//       crenaux11h30: 1,
//       crenaux13h30: 0,
//       crenaux14h00: 0,
//       crenaux14h30: 0,
//       crenaux15h00: 1,
//       crenaux15h30: 0,
//     ]
//   },
// ]

export default {
  components: {
    PageTitle,
    ScheduleInspectorDialog,
  },

  data () {
    return {
      active: null,
      headers,
      date: new Date().toISOString().substr(0, 10),
      currentWeekNumber: DateTime.local().setLocale('fr').weekNumber,
      menu2: false,
      inspecteurs: [],
    }
  },

  computed: {
    computedDateFormatted () {
      return this.formatDate(this.date)
    },

    placesByCentreList () {
      return this.$store.state.admin.placesByCentre.list
    },

    // inspecteurs () {
    //   const fakeInspecteursArray = [
    //     {
    //       _id: '0123456789',
    //       nom: 'SCUTTLE',
    //       prenom: 'prenomScuttle',
    //       email: 'scuttle@example.com',
    //       matricule: '0123456789',
    //       crenaux: [],
    //     },
    //     {
    //       _id: '0123456788',
    //       nom: 'CHARLIE',
    //       prenom: 'prenomCharlie',
    //       email: 'scuttle@example.com',
    //       matricule: '0123456788',
    //       crenaux: [],
    //     },
    //   ]
    //   return fakeInspecteursArray
    // },
  },

  methods: {
    formatDate (date) {
      if (!date) return null
      const [year, month, day] = date.split('-')
      return `${month}/${day}/${year}`
    },

    async centreSelector (centreId) {
      let reservastionsByCentre = {}
      this.placesByCentreList.find(element => {
        if (element.centre._id === centreId) {
          const result = element.places[this.currentWeekNumber].filter(place => {
            const currentDate = DateTime.fromISO(place.date).setLocale('fr').toISODate()
            const dateTofind = DateTime.fromSQL(this.date).setLocale('fr').toISODate()
            if (currentDate === dateTofind) {
              return place
            }
          })
          console.log({result})
          reservastionsByCentre = { centre: element.centre , places: result }
          return result
        }
      })

      const fakeInspecteursArray = [
        {
          _id: '0123456789',
          nom: 'SCUTTLE',
          prenom: 'prenomScuttle',
          email: 'scuttle@example.com',
          matricule: '0123456789',
          crenaux: [],
        },
        {
          _id: '0123456788',
          nom: 'CHARLIE',
          prenom: 'prenomCharlie',
          email: 'scuttle@example.com',
          matricule: '0123456788',
          crenaux: [],
        },
      ]

      reservastionsByCentre.places.map(element => {
          fakeInspecteursArray.find(item => item.nom === element.inspecteur)
          .crenaux.push({
            [DateTime.fromISO(element.date).setLocale('fr').toFormat("HH'h'mm")]: {
              status: element.candidat ? 'booked' : 'free',
            }
          })
      })
      this.inspecteurs = fakeInspecteursArray
      console.log({reservastionsByCentre})
      console.log({inspecteurs: this.inspecteurs})
    },
  },

  watch: {
    date (val) {
      this.dateFormatted = this.formatDate(this.date)
      this.currentWeekNumber = DateTime.fromSQL(this.date).setLocale('fr').weekNumber
    },
  },
}
</script>

<style lang="stylus" scoped>
.container {
  max-width: 100%;
  padding: 1px;
}

.center-title {
  margin-top: 4em;
}

.date-selector {
  margin-top: 4em;
}

.tabs {
  zoom: 90%;
}
</style>
