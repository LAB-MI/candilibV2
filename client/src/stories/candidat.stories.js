/* eslint-disable import/no-extraneous-dependencies */
import { storiesOf } from '@storybook/vue'
import { action } from '@storybook/addon-actions'

// candidat Components
import CandidatProfile from '../views/candidat/components/MyProfile.vue'
import CandidatProfileInfo from '../views/candidat/components/ProfileInfo.vue'
import CandidatSignupForm from '../views/candidat/components/SignupForm.vue'
import CandidatNavigationDrawer from '../views/candidat/components/NavigationDrawer.vue'
import CandidatEmailValidation from '../views/candidat/components/EmailValidationComponent.vue'
import CandidatHeader from '../views/candidat/components/CandidatHeader.vue'
import CandidatFooter from '../views/candidat/components/CandidatFooter.vue'

storiesOf('Candidat Components', module)
  .add('CandidatProfile', () => ({
    components: { CandidatProfile },
    template: '<my-profile />',
    methods: { action: action('clicked') },
  }))
  .add('CandidatProfileInfo', () => ({
    components: { CandidatProfileInfo },
    template: '<profile-info />',
    methods: { action: action('clicked') },
  }))
  .add('CandidatSignupForm', () => ({
    components: { CandidatSignupForm },
    template: '<signup-form />',
    methods: { action: action('clicked') },
  }))
  .add('CandidatNavigationDrawer', () => ({
    components: { CandidatNavigationDrawer },
    template: '<navigation-drawer />',
    methods: { action: action('clicked') },
  }))
  .add('CandidatEmailValidation', () => ({
    components: { CandidatEmailValidation },
    template: '<email-validation />',
    methods: { action: action('clicked') },
  }))
  .add('CandidatHeader', () => ({
    components: { CandidatHeader },
    template: '<candidat-header />',
    methods: { action: action('clicked') },
  }))
  .add('CandidatFooter', () => ({
    components: { CandidatFooter },
    template: '<candidat-footer />',
    methods: { action: action('clicked') },
  }))
