'use strict'

import pointOfView from 'point-of-view'
import nunjucks from 'nunjucks'

import pollRoute from './routes/main/post.js'
import getJobRoute from './routes/main/get.js'

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

export default fastifyCloudPrnt
