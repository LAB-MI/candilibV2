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

const connectAndCallback = (callback) => {
  mongoClient.connect(mongoURL, function (err, db) {
    if (err) throw err
    console.log('Database connected!')
    const dbo = db.db(dbName)
    callback(dbo, () => db.close())
  })
}

const dateRegexp = new RegExp(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
const parseToDatesFromObj = (obj) => {
  for (const property in obj) {
    const value = obj[property]

    if (dateRegexp.test(value)) {
      obj[property] = new Date(value)
    }
  }
  return obj
}
const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(morgan('tiny'))

app.get('/version', (req, res) => {
  res.send('0.0.0')
})

app.get('/:collection', (req, res) => {
  const { collection } = req.params
  console.info(collection)
  try {
    connectAndCallback((db, done) => {
      db.collection(collection).find({}).toArray((err, result) => {
        if (err) throw err
        res.json(result)
        done()
      })
    })
  } catch (err) {
    res.status(500).send(err)
  }
})

app.delete('/:collection/:id', (req, res) => {
  const { collection, id } = req.params
  console.info('delete', collection, id)
  let filter = {}
  if (req.body) filter = { ...req.body }
  if (id) filter._id = new ObjectId(id)
  try {
    connectAndCallback((db, done) => {
      db.collection(collection).deleteOne(filter, (err, obj) => {
        if (err) throw err
        res.send({ success: true, result: obj.result })
        done()
      })
    })
  } catch (err) {
    res.status(500).send(err)
  }
})
app.post('/:collection', (req, res) => {
  const { collection } = req.params

  try {
    connectAndCallback((db, done) => {
      db.collection(collection).insertOne(req.body, (err, obj) => {
        if (err) throw err
        res.send({ success: true, result: obj.result, _id: obj.ops.length > 0 ? obj.ops[1]._id : undefined })
        done()
      })
    })
  } catch (err) {
    res.status(500).send(err)
  }
})

app.patch('/:collection', (req, res) => {
  const { collection } = req.params
  const { query, update, many } = req.body
  try {
    const newUpdate = parseToDatesFromObj(update)
    connectAndCallback((db, done) => {
      if (many) {
        try {
          db.collection(collection).updateMany(query || { }, { $set: newUpdate }, (err, obj) => {
            try {
              if (err) { return res.status(500).send(err) }
              res.send({
                success: true,
                result: obj.result,
              // _id: obj.ops.length > 0 ? obj.ops[1]._id : undefined,
              })
              done()
            } catch (err) {
              console.error({ collection, query, newUpdate, err })
              res.status(500).send(err.message)
            }
          })
        } catch (err) {
          console.error({ collection, query, newUpdate, err })
          res.status(500).send(err.message)
        }
      } else {
        try {
          db.collection(collection).updateOne(query || { }, { $set: newUpdate }, (err, obj) => {
            try {
              if (err) { return res.status(500).send(err) }
              res.send({
                success: true,
                result: obj.result,
                // _id: obj.ops.length > 0 ? obj.ops[1]._id : undefined,
              })
              done()
            } catch (err) {
              console.error({ collection, query, newUpdate, err })
              res.status(500).send(err.message)
            }
          })
        } catch (err) {
          console.error({ collection, query, newUpdate, err })
          res.status(500).send(err.message)
        }
      }
    })
  } catch (err) {
    console.error(err)
    res.status(500).send(err)
  }
})

module.exports = app
