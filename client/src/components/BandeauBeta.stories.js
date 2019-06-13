import { storiesOf } from '@storybook/vue'
import BandeauBeta from '@/components/BandeauBeta.vue'

storiesOf('Common/BandeauBeta', module)
  .add('bandeau-beta', () => ({
    components: {
      BandeauBeta,
    },
    template: `<bandeau-beta />`,
  }))
