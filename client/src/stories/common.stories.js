/* eslint-disable import/no-extraneous-dependencies */
import { storiesOf } from '@storybook/vue'

import AppVersion from '../components/AppVersion.vue'

import hexagon from '@/assets/images/hexagon.svg'
import Hexagon from '@/components/Hexagon.vue'

storiesOf('Common/Hexagon', module)
  .add('Naked', () => ({
    data () {
      return { hexagon }
    },
    template: `${hexagon}`,
  }))
  .add('Dressed 1', () => ({
    components: {
      Hexagon,
    },
    template: `<v-toolbar dark><hexagon value="75" /></v-toolbar>`,
  }))
  .add('Dressed 2', () => ({
    components: {
      Hexagon,
    },
    template: `<v-toolbar dark><div class="c-two-hexagons"><hexagon value="75" :active="true" /><hexagon value="93" /></div></v-toolbar>`,
  }))
storiesOf('Common/AppVersion', module)
  .add('Basic', () => ({
    components: { AppVersion },
    template: `<app-version />`,
  }))
