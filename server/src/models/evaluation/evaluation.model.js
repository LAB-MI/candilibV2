import mongoose from 'mongoose'

const { Schema } = mongoose

const EvaluationSchema = new Schema({
  note: {
    type: Number,
  },
  comment: {
    type: String,
  },
})

export default mongoose.model('evaluation', EvaluationSchema)
