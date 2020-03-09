/* eslint-disable import/no-extraneous-dependencies */
import { storiesOf } from '@storybook/vue'

import hexagon from '@/assets/images/hexagon.svg'
import Hexagon from '@/components/Hexagon.vue'

storiesOf('Common/Hexagon', module)
  .add('Simple SVG', () => ({
    data () {
      return { hexagon }
    },
    template: `${hexagon}`,
  }))
  .add('With text', () => ({
    components: {
      Hexagon,
    },
    template: '<v-toolbar dark><hexagon value="75" /></v-toolbar>',
  }))
