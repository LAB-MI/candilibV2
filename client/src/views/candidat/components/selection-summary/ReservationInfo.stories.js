import { storiesOf } from '@storybook/vue'

import ReservationInfo from './ReservationInfo.vue'

storiesOf('Candidat', module)
  .add('ReservationInfo', () => ({
    components: { ReservationInfo },
    template: '<reservation-info :adresse="adresse" :date="date" :nom="nom" :infoResa="{adresse, date, nom}"/>',
    data: () => ({
      adresse: '99 Avenue du Général de Gaulle, Rosny ss Bois, FR, 93110',
      date: 'dimanche 30 juin à 15:30',
      nom: 'Rosny',
    }),
  }))
