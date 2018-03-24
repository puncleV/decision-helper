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
      this.films = this.db.collection('films')
      this.tvSeries = this.db.collection('tvSeries')
    } catch (e) {
      console.error(e.message)
      status = false
    }

    return status
  }

  async addFilm (name, priority) {
    let status = true

    try {
      await this.films.insertOne({
        name,
        priority
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
