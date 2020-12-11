import mongoose from 'mongoose'

const { Schema } = mongoose

const LogActionsCandidatSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },

    beginAt: {
      type: Date,
      required: true,
    },

    savedAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

LogActionsCandidatSchema.index({ type: 1, savedAt: 1 })

const model = mongoose.model('LogActionsCandidat', LogActionsCandidatSchema)

/**
 * @typedef {Object} LogActionsCandidatModel
 * @property {String} type
 * @property {Array[String]} responseBody
 * @property {String} content
 * @property {date} beginAt
 * @property {date} savedAt
 */
export default model
