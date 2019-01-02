import { getHash, compareToHash } from './crypto'

describe('Crypto', () => {
  it('Should create two different hash that compare successfully', () => {
    const pwd = 'Abcdef1*'
    const firstHash = getHash(pwd)
    const comparison = compareToHash(pwd, firstHash)

    expect(comparison).toBe(true)
  })
})
