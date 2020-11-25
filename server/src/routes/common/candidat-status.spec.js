
import { getDelayFromStatus } from './candidat-status'

jest.mock('./candidat-status-const')

describe('candidat Statuses', () => {
  it('should ', () => {
    const result = getDelayFromStatus(3)
    expect(result).toBe(30 * 60 * 1000)
  })
})
