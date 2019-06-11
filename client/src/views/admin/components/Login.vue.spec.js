import { shallowMount } from '@vue/test-utils'
import Login from './Login.vue'

describe('Login.vue', () => {
  it('renders props.msg when passed', () => {
    const title = 'ADMINISTRATEUR'
    const subtitle = 'CANDILIB'
    const wrapper = shallowMount(Login)
    expect(wrapper.text()).toContain(title)
    expect(wrapper.text()).toContain(subtitle)
  })
})
