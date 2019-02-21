import { storiesOf } from '@storybook/vue'

import LandingPage from './LandingPage.vue'

storiesOf('Candidat', module)
  .add('LandingPage', () => ({
    components: { LandingPage },
    template: `<landing-page />`,
  }))
