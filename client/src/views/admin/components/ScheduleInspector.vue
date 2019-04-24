<template>
  <v-container class="container" grid-list-md>
    <v-layout row wrap>
      <v-flex class="center-title" xs3>
        <page-title title="Centres d'examen"/>
      </v-flex>
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
                <td>{{ props.item.name }}</td>
                <td class="text-xs-right">
                  <v-btn>
                    <v-icon>
                      {{ props.item.crenaux8h00 ? 'face' : 'not_interested' }}
                    </v-icon>
                  </v-btn>
                </td>
                <td class="text-xs-right">
                  <v-btn>
                    <v-icon>
                      {{ props.item.crenaux8h30 ? 'face' : 'not_interested' }}
                    </v-icon>
                  </v-btn>
                </td>
                <td class="text-xs-right">
                  <v-btn>
                    <v-icon>
                      {{ props.item.crenaux9h00 ? 'face' : 'not_interested' }}
                    </v-icon>
                  </v-btn>
                </td>
                <td class="text-xs-right">
                  <v-btn>
                    <v-icon>
                      {{ props.item.crenaux9h30 ? 'face' : 'not_interested' }}
                    </v-icon>
                  </v-btn>
                </td>
                <td class="text-xs-right">
                  <v-btn>
                    <v-icon>
                      {{ props.item.crenaux10h00 ? 'face' : 'not_interested' }}
                    </v-icon>
                  </v-btn>
                </td>
                <td class="text-xs-right">
                  <v-btn>
                    <v-icon>
                      {{ props.item.crenaux10h30 ? 'face' : 'not_interested' }}
                    </v-icon>
                  </v-btn>
                </td>
                <td class="text-xs-right">
                  <v-btn>
                    <v-icon>
                      {{ props.item.crenaux11h00 ? 'face' : 'not_interested' }}
                    </v-icon>
                  </v-btn>
                </td>
                <td class="text-xs-right">
                  <v-btn>
                    <v-icon>
                      {{ props.item.crenaux11h30 ? 'face' : 'not_interested' }}
                    </v-icon>
                  </v-btn>
                </td>
                <td class="text-xs-right">
                  <v-btn>
                    <v-icon>
                      {{ props.item.crenaux13h30 ? 'face' : 'not_interested' }}
                    </v-icon>
                  </v-btn>
                </td>
                <td class="text-xs-right">
                  <v-btn>
                    <v-icon>
                      {{ props.item.crenaux14h00 ? 'face' : 'not_interested' }}
                    </v-icon>
                  </v-btn>
                </td>
                <td class="text-xs-right">
                  <v-btn>
                    <v-icon>
                      {{ props.item.crenaux14h30 ? 'face' : 'not_interested' }}
                    </v-icon>
                  </v-btn>
                </td>
                <td class="text-xs-right">
                  <v-btn>
                    <v-icon>
                      {{ props.item.crenaux15h00 ? 'face' : 'not_interested' }}
                    </v-icon>
                  </v-btn>
                </td>
                <td class="text-xs-right">
                  <v-btn>
                    <v-icon>
                      {{ props.item.crenaux15h30 ? 'face' : 'not_interested' }}
                    </v-icon>
                  </v-btn>
                </td>
              </template>
            </v-data-table>
          </v-tab-item>
        </v-tabs>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import PageTitle from '@/components/PageTitle.vue'

const crenaux = [
  '',
  '8h00',
  '8h30',
  '9h00',
  '9h30',
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
const inspecteurs = [
  {
    name: 'Inspecteur1',
    crenaux8h00: 1,
    crenaux8h30: 1,
    crenaux9h00: 0,
    crenaux9h30: 0,
    crenaux10h00: 0,
    crenaux10h30: 0,
    crenaux11h00: 0,
    crenaux11h30: 1,
    crenaux13h30: 0,
    crenaux14h00: 0,
    crenaux14h30: 0,
    crenaux15h00: 1,
    crenaux15h30: 0,
  },
  {
    name: 'Inspecteur2',
    crenaux8h00: 1,
    crenaux8h30: 1,
    crenaux9h00: 0,
    crenaux9h30: 0,
    crenaux10h00: 0,
    crenaux10h30: 0,
    crenaux11h00: 1,
    crenaux11h30: 0,
    crenaux13h30: 0,
    crenaux14h00: 0,
    crenaux14h30: 0,
    crenaux15h00: 1,
    crenaux15h30: 0,
  },
  {
    name: 'Inspecteur3',
    crenaux8h00: 1,
    crenaux8h30: 1,
    crenaux9h00: 0,
    crenaux9h30: 1,
    crenaux10h00: 0,
    crenaux10h30: 0,
    crenaux11h00: 0,
    crenaux11h30: 0,
    crenaux13h30: 0,
    crenaux14h00: 0,
    crenaux14h30: 0,
    crenaux15h00: 1,
    crenaux15h30: 0,
  },
  {
    name: 'Inspecteur4',
    crenaux8h00: 1,
    crenaux8h30: 1,
    crenaux9h00: 0,
    crenaux9h30: 0,
    crenaux10h00: 0,
    crenaux10h30: 0,
    crenaux11h00: 0,
    crenaux11h30: 0,
    crenaux13h30: 0,
    crenaux14h00: 0,
    crenaux14h30: 0,
    crenaux15h00: 1,
    crenaux15h30: 0,
  },
  {
    name: 'Inspecteur5',
    crenaux8h00: 1,
    crenaux8h30: 1,
    crenaux9h00: 0,
    crenaux9h30: 0,
    crenaux10h00: 1,
    crenaux10h30: 1,
    crenaux11h00: 0,
    crenaux11h30: 0,
    crenaux13h30: 0,
    crenaux14h00: 0,
    crenaux14h30: 0,
    crenaux15h00: 1,
    crenaux15h30: 0,
  },
  {
    name: 'Inspecteur6',
    crenaux8h00: 1,
    crenaux8h30: 1,
    crenaux9h00: 0,
    crenaux9h30: 0,
    crenaux10h00: 0,
    crenaux10h30: 1,
    crenaux11h00: 1,
    crenaux11h30: 1,
    crenaux13h30: 0,
    crenaux14h00: 0,
    crenaux14h30: 0,
    crenaux15h00: 1,
    crenaux15h30: 0,
  },
  {
    name: 'Inspecteur7',
    crenaux8h00: 1,
    crenaux8h30: 1,
    crenaux9h00: 0,
    crenaux9h30: 0,
    crenaux10h00: 0,
    crenaux10h30: 0,
    crenaux11h00: 1,
    crenaux11h30: 0,
    crenaux13h30: 0,
    crenaux14h00: 0,
    crenaux14h30: 0,
    crenaux15h00: 1,
    crenaux15h30: 0,
  },
  {
    name: 'Inspecteur8',
    crenaux8h00: 1,
    crenaux8h30: 1,
    crenaux9h00: 0,
    crenaux9h30: 0,
    crenaux10h00: 0,
    crenaux10h30: 0,
    crenaux11h00: 0,
    crenaux11h30: 0,
    crenaux13h30: 1,
    crenaux14h00: 0,
    crenaux14h30: 0,
    crenaux15h00: 1,
    crenaux15h30: 0,
  },
  {
    name: 'Inspecteur9',
    crenaux8h00: 1,
    crenaux8h30: 1,
    crenaux9h00: 0,
    crenaux9h30: 0,
    crenaux10h00: 0,
    crenaux10h30: 0,
    crenaux11h00: 0,
    crenaux11h30: 0,
    crenaux13h30: 0,
    crenaux14h00: 0,
    crenaux14h30: 0,
    crenaux15h00: 1,
    crenaux15h30: 0,
  },
  {
    name: 'Inspecteur10',
    crenaux8h00: 1,
    crenaux8h30: 1,
    crenaux9h00: 0,
    crenaux9h30: 0,
    crenaux10h00: 0,
    crenaux10h30: 1,
    crenaux11h00: 1,
    crenaux11h30: 1,
    crenaux13h30: 1,
    crenaux14h00: 0,
    crenaux14h30: 0,
    crenaux15h00: 1,
    crenaux15h30: 0,
  },
  {
    name: 'Inspecteur11',
    crenaux8h00: 1,
    crenaux8h30: 1,
    crenaux9h00: 0,
    crenaux9h30: 0,
    crenaux10h00: 0,
    crenaux10h30: 0,
    crenaux11h00: 0,
    crenaux11h30: 0,
    crenaux13h30: 0,
    crenaux14h00: 0,
    crenaux14h30: 0,
    crenaux15h00: 1,
    crenaux15h30: 0,
  },
  {
    name: 'Inspecteur12',
    crenaux8h00: 1,
    crenaux8h30: 1,
    crenaux9h00: 0,
    crenaux9h30: 0,
    crenaux10h00: 0,
    crenaux10h30: 1,
    crenaux11h00: 1,
    crenaux11h30: 0,
    crenaux13h30: 0,
    crenaux14h00: 0,
    crenaux14h30: 0,
    crenaux15h00: 1,
    crenaux15h30: 0,
  },
  {
    name: 'Inspecteur13',
    crenaux8h00: 1,
    crenaux8h30: 1,
    crenaux9h00: 0,
    crenaux9h30: 0,
    crenaux10h00: 0,
    crenaux10h30: 0,
    crenaux11h00: 1,
    crenaux11h30: 1,
    crenaux13h30: 1,
    crenaux14h00: 1,
    crenaux14h30: 1,
    crenaux15h00: 1,
    crenaux15h30: 0,
  },
]

export default {
  components: {
    PageTitle,
  },

  data () {
    return {
      active: null,
      headers,
      inspecteurs,
      date: new Date().toISOString().substr(0, 10),
      menu2: false,
    }
  },

  computed: {
    placesByCentreList () {
      return this.$store.state.admin.placesByCentre.list
    },

    computedDateFormatted () {
      return this.formatDate(this.date)
    },
  },

  methods: {
    formatDate (date) {
      if (!date) return null
      const [year, month, day] = date.split('-')
      return `${month}/${day}/${year}`
    },
  },

  watch: {
    date (val) {
      this.dateFormatted = this.formatDate(this.date)
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
