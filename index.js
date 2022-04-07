'use strict'

const pointOfView = require('point-of-view')
const nunjucks = require('nunjucks')

const pollRoute = require('./routes/main/post')
const getJobRoute = require('./routes/main/get')

async function fastifyCloudPrnt (fastify, options) {

  const defaultOptions = {
    getJob: () => null,
    getJobData: () => {}
  }

  const {
    getJob,
    getJobData
  } = {
    ...defaultOptions,
    ...options
  }

  fastify.register(pointOfView, { engine: { nunjucks } })

  fastify.decorate('getJob', getJob)
  fastify.decorate('getJobData', getJobData)

  fastify.route(pollRoute)
  fastify.route(getJobRoute)
}

module.exports = fastifyCloudPrnt
