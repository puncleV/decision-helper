'use strict'
const MongoClient = require('mongodb').MongoClient

class DbHelper {
  constructor (config) {
    this.config = config
    this.db = null
  }

  async initialize () {
    let status = true

    try {
      this.client = await MongoClient.connect(this.config.url)
      this.db = this.client.db(this.config.name)
      this.toWatch = this.db.collection('toWatch')
      this.participants = this.db.collection('participants')
    } catch (e) {
      console.error(e.message)
      status = false
    }

    return status
  }

  async addToWatch (name, priority, wantedBy, type) {
    let status = true

    try {
      await this.toWatch.insertOne({
        name,
        priority,
        done: false,
        wantedBy,
        type
      })
    } catch (e) {
      console.error(e.message)
      status = false
    }

    return status
  }

  async addParticipant (name) {
    let status = true

    const participantsCount = await this.participants.count()
    const newOdds = ~~(100 / (participantsCount + 1))

    this.participants.updateMany({}, {$set: {odds: newOdds}})

    try {
      await this.participants.insertOne({
        name,
        odds: newOdds
      })
    } catch (e) {
      console.error(e.message)
      status = false
    }

    return status
  }

  close () {
    return this.client.close()
  }
}

module.exports = DbHelper
