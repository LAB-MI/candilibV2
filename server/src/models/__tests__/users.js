import userModel from '../user/user.model'
import { createUser } from '../user'

export const users = [
  {
    email: 'admin@example.com',
    password: 'Admin*78',
    departements: ['75', '93'],
    status: 'admin',
  },
  {
    email: 'delegue@example.com',
    password: 'Admin*78',
    departements: ['75', '93'],
    status: 'delegue',
  },
  {
    email: 'admin75@example.com',
    password: 'Admin*78',
    departements: ['75', '93'],
    status: 'repartiteur',
  },
]

export const createUsers = async () => {
  return Promise.all(users.map(user => createUser(user.email, user.password, user.departements, user.status)))
}

export const deleteUsers = async () => {
  await userModel.deleteMany({})
}
