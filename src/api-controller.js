'use strict'
const micro = require('micro')

class ApiController {
  constructor (config, dbHelper) {
    this.server = micro(this.requestHandler.bind(this))
    this.server.listen(config.port)
    console.log('Listening at', config.port)
    this.db = dbHelper
  }

  async requestHandler (req) {
    try {
      const data = await micro.json(req)

      return await this.queryHandler(data)
    } catch (e) {
      console.error('Can\'t handle request.', e.message)
      return ApiController.apiError()
    }
  }

  static apiError (message) {
    return {
      status: -1,
      message
    }
  }

  async queryHandler (message) {
    const command = message.command
    let response = {}

    switch (command) {
      case 'getToday':
        return this.getToday()
      case 'addFilm':
        return this.addToWatch(message.data, 'film')
      case 'addSeries':
        return this.addToWatch(message.data, 'tvSeries')
      case 'addParticipant':
        return this.addParticipant(message.data)
      case 'exit':
        response.status = 0
        response.message = 'ok'

        await this.db.close()

        setTimeout(() => { process.exit(0) }, 500)
        break
      default:
        response = ApiController.apiError(`Unknown command: ${command}`)
    }

    return response
  }

  async addToWatch (data, type) {
    let response = {}

    if (
      void 0 === data ||
      typeof data.name !== 'string' || data.name.length === 0 ||
      typeof data.wantedBy !== 'string' || data.wantedBy.length === 0 ||
      isNaN(data.priority)
    ) {
      response = ApiController.apiError('Validation failed.')
    } else {
      const insertionResult = await this.db.addToWatch(data.name, data.priority, data.wantedBy, type)

      if (insertionResult) {
        response = {
          status: 0,
          message: `successfully add ${type}`
        }
      } else {
        response = ApiController.apiError(`cannot add ${type}, read logs for more info`)
      }
    }

    return response
  }

  async addParticipant (data) {
    let response = {}

    if (
      void 0 === data ||
      typeof data.name !== 'string'
    ) {
      response = ApiController.apiError('Validation failed.')
    } else {
      const insertionResult = await this.db.addParticipant(data.name)

      if (insertionResult) {
        response = {
          status: 0,
          message: `successfully add ${data.name}`
        }
      } else {
        response = ApiController.apiError(`cannot add ${data.name}, read logs for more info`)
      }
    }

    return response
  }

  getToday () {
    return this.db.getToday()
  }
}

module.exports = ApiController
