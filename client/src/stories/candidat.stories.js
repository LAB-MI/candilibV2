/* eslint-disable import/no-extraneous-dependencies */
import { storiesOf } from '@storybook/vue'

import MyProfile from '../views/candidat/components/MyProfile.vue'
import CandidatProfileInfo from '../views/candidat/components/ProfileInfo.vue'
import CandidatSignupForm from '../views/candidat/components/SignupForm.vue'
import NavigationDrawer from '../views/candidat/components/NavigationDrawer.vue'
import EmailValidation from '../views/candidat/components/EmailValidationComponent.vue'
import CandidatHeader from '../views/candidat/components/CandidatHeader.vue'
import CandidatFooter from '../views/candidat/components/CandidatFooter.vue'
import CenterSelection from '../views/candidat/components/center-selection/CenterSelection.vue'

import store from '../store'

storiesOf('Candidat Components', module)
  .add('CandidatProfile', () => ({
    components: { MyProfile },
    template: '<my-profile />',
  }))
  .add('CandidatProfileInfo', () => ({
    components: { CandidatProfileInfo },
    template: '<profile-info />',
  }))
  .add('CandidatSignupForm', () => ({
    components: { CandidatSignupForm },
    template: '<candidat-signup-form />',
  }))
  .add('NavigationDrawer', () => ({
    components: { NavigationDrawer },
    template: '<navigation-drawer />',
  }))
  .add('EmailValidation', () => ({
    components: { EmailValidation },
    template: '<email-validation />',
  }))
  .add('CandidatHeader', () => ({
    components: { CandidatHeader },
    template: '<candidat-header />',
  }))
  .add('CandidatFooter', () => ({
    components: { CandidatFooter },
    template: '<candidat-footer />',
  }))
  .add('CenterSelection', () => ({
    components: { CenterSelection },
    store: store,
    template: '<center-selection />',
  }))
