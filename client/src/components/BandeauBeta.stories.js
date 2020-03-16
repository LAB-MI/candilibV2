import { storiesOf } from '@storybook/vue'
import BandeauBeta from '@/components/BandeauBeta.vue'

storiesOf('Common/BandeauBeta', module).add('BandeauBeta', () => ({
  components: {
    BandeauBeta,
  },
  template: '<bandeau-beta />',
}))
