import mongoose from 'mongoose'

const { Schema } = mongoose
const ObjectId = Schema.Types.ObjectId

const SessionCandidatSchema = new Schema(
  {
    userId: {
      type: ObjectId,
      required: true,
    },

    session: {
      type: Object,
      default: {},
    },

    count: {
      type: Number,
      default: 0,
    },

    canRetryAt: {
      type: Date,
      default: null,
    },

    captchaExpireAt: {
      type: Date,
      required: true,
    },

    expires: {
      type: Date,
      required: true,
    },
  },

  {
    timestamps: true,
  },
)

SessionCandidatSchema.index({ userId: 1 }, { unique: true })

const model = mongoose.model('SessionCandidat', SessionCandidatSchema)

/**
 * @typedef {Object} SessionCandidatModel
 * @property {ObjectId} userId
 * @property {Object} session
 * @property {Number} count
 * @property {date} captchaExpireAt
 * @property {date} canRetryAt
 * @property {date} expires
 */
export default model
