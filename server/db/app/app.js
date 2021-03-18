const express = require('express')
const bodyParser = require('body-parser')
const mongoClient = require('mongodb').MongoClient
const ObjectId = require('mongodb').ObjectID
const morgan = require('morgan')

const dbName = process.env.DB_NAME || 'candilib'
const dbAdmin = process.env.DB_USER || 'adminCandilib'
const dbPassword = process.env.DB_PASS || 'changeme78'

const mongoURL =
  process.env.MONGO_URL ||
  `mongodb://${dbAdmin}:${dbPassword}@localhost:27017/${dbName}`

class Dbo {
  constructor (db) {
    this.db = db
    this.dbo = db.db(dbName)
  }

  collection (collectionName) {
    return this.dbo.collection(collectionName)
  }

  close () {
    this.db.close()
  }
}

const connectDb = async () => {
  const db = await mongoClient.connect(mongoURL)
  return new Dbo(db)
}

const dateRegexp = new RegExp(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
const parseFromObj = (obj) => {
  for (const property in obj) {
    const value = obj[property]
    if (value && value instanceof Object) {
      obj[property] = parseFromObj(value)
    } else if (value && dateRegexp.test(value)) {
      obj[property] = new Date(value)
    }
  }
  return obj
}

const parseBody = (req, res, next) => {
  try {
    req.newBody = parseFromObj(req.body)
    next()
  } catch (err) {
    console.error({ err })
    res.status(500).send(err.message)
  }
}

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(morgan('tiny'))

app.get('/version', (req, res) => {
  res.send('0.0.0')
})

app.get('/:collection', async (req, res) => {
  const { collection } = req.params
  let filter = {}
  if (req.body) filter = { ...req.body }

  let dbo
  try {
    dbo = await connectDb()
    const result = await dbo.collection(collection).find(filter).toArray()
    res.json(result)
  } catch (err) {
    console.error(err)
    res.status(500).send(err.message)
  } finally {
    dbo && dbo.close()
  }
})

app.delete('/:collection/:id', parseBody, async (req, res) => {
  const { collection, id } = req.params
  let filter = {}
  if (req.body) filter = { ...req.body }
  let dbo
  try {
    if (id) filter._id = new ObjectId(id)
    dbo = await connectDb()
    const obj = await dbo.collection(collection).deleteOne(filter)
    res.send({ success: true, result: obj.result })
  } catch (err) {
    res.status(500).send(err.message)
  } finally {
    dbo && dbo.close()
  }
})

app.delete('/:collection', async (req, res) => {
  const { collection } = req.params
  let filter = {}
  if (req.body) filter = { ...req.body }

  let dbo
  try {
    dbo = await connectDb()
    const obj = await dbo.collection(collection).deleteMany(filter)
    res.send({ success: true, result: obj.result })
  } catch (err) {
    console.error(err)
    res.status(500).send(err)
  } finally {
    dbo && dbo.close()
  }
})

app.post('/:collection', parseBody, async (req, res) => {
  const { collection } = req.params
  let dbo
  try {
    dbo = await connectDb()
    const obj = await dbo.collection(collection).insertOne(req.newBody)
    res.send({ success: true, result: obj.result, _id: obj.ops.length > 0 ? obj.ops[0]._id : undefined })
  } catch (err) {
    console.error({ collection, body: req.body, err })
    res.status(500).send(err)
  } finally {
    dbo && dbo.close()
  }
})

app.patch('/:collection', parseBody, async (req, res) => {
  const { collection } = req.params
  const { query, update } = req.newBody
  let dbo
  try {
    dbo = await connectDb()
    const obj = await dbo.collection(collection).updateMany(query || { }, { $set: update })
    res.send({
      success: true,
      result: obj.result,
    })
  } catch (err) {
    console.error({ collection, query, update, err })
    res.status(500).send(err.message)
  } finally {
    dbo && dbo.close()
  }
})

app.patch('/:collection/:id', parseBody, async (req, res) => {
  const { collection } = req.params
  const { query, update } = req.newBody
  let dbo
  try {
    dbo = await connectDb()
    const obj = await dbo.collection(collection).updateOne(query || { }, { $set: update })
    res.send({
      success: true,
      result: obj.result,
    })
  } catch (err) {
    console.error({ collection, query, update, err })
    res.status(500).send(err.message)
  } finally {
    dbo && dbo.close()
  }
})

module.exports = app
