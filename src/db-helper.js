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

    // const participantsCount = await this.participants.count()
    // const newOdds = ~~(100 / (participantsCount + 1))
    //
    // this.participants.updateMany({}, {$set: {odds: newOdds}})

    try {
      await this.participants.insertOne({
        name,
        selected: 1
      })
    } catch (e) {
      console.error(e.message)
      status = false
    }

    return status
  }

  async getToday () {
    const participants = await this.participants.find({}).toArray()
    const selectedSum = participants.reduce((a, b) => a.selected + b.selected)

    let randomValue = ~~(Math.random() * 100)
    let result = {}

    for (;;) {
      const participant = participants.pop()

      if (void 0 === participant) {
        break
      }
      const odds = 100 * (1 - participant.selected / selectedSum)

      if (randomValue - odds <= 0) {
        const type = ~~(Math.random() * 100) < 15 ? 'film' : 'tvSeries'

        result = await this.toWatch.findOne({
          wantedBy: participant.name,
          type,
          done: false
        }, {
          sort: ['priority']
        })

        await this.participants.updateOne({
          _id: participant._id
        }, {
          $set: {
            selected: participant.selected + 1
          }
        })

        break
      }

      randomValue -= odds
    }

    return result
  }

  close () {
    return this.client.close()
  }
}

module.exports = DbHelper
