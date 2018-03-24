'use strict'
const MongoClient = require('mongodb').MongoClient
const config = require('../config')

MongoClient.connect(config.database.url).then(async (client) => {
  const db = client.db(config.database.name)
  const toWatch = db.collection('toWatch')

  try {
    await toWatch.createIndexes([{
      key: {
        done: 1
      }
    }, {
      key: {
        priority: 1
      }
    }, {
      key: {
        type: 1,
        wantedBy: 1
      }
    }])
  } catch (e) {
    console.error(e.message)
  }
})
