export class ErrorWithStatus extends Error {
  constructor (status, message) {
    super(message)
    this._status = status
  }

  get status () {
    return this._status
  }
}
