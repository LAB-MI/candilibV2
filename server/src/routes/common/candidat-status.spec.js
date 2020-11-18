
import { getDuration } from './candidat-status'

jest.mock('./candidat-status-const')

describe('candidat Statuses', () => {
  it('should ', () => {
    const result = getDuration(4)
    expect(result).toBe(30 * 60 * 1000)
  })
})
