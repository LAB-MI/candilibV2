import { connect, disconnect } from '../../mongo-connection'
import { createDepartement, deleteDepartementById } from '../departement'
import { createCandidats } from '../__tests__'
import { findCandidatByEmail } from './candidat.queries'

describe('Get isInRecentlyDept', () => {
  beforeAll(async () => {
    await connect()
    await createCandidats()
  })

  afterAll(async () => {
    await disconnect()
  })

  it('should get document from dept', async () => {
    await createDepartement({ _id: '93', email: '93@dep.com', isAddedRecently: true })
    const candidat = await findCandidatByEmail('test1.test@test.com')
    if (!candidat.populated('homeDeptDocument')) {
      await candidat.populate('homeDeptDocument').execPopulate()
    }
    expect(candidat.homeDeptDocument).toBeDefined()
    await deleteDepartementById('93')
  })

  it('should get isInRecentlyDept', async () => {
    await createDepartement({ _id: '93', email: '93@dep.com', isAddedRecently: true })
    const candidat = await findCandidatByEmail('test1.test@test.com')
    const isInRecentlyDept = await candidat.isInRecentlyDept
    expect(isInRecentlyDept).toBe(true)
    await deleteDepartementById('93')
  })

  it('should get isInRecentlyDept without dept', async () => {
    const candidat = await findCandidatByEmail('test1.test@test.com')
    const isInRecentlyDept = await candidat.isInRecentlyDept
    expect(isInRecentlyDept).toBe(false)
  })
})
