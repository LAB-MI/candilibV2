import { connect } from '../mongo-connection'

let mongoose
export const getConnectDB = async () => {
  if (!mongoose) {
    mongoose = await connect()
  }

  return mongoose
}
