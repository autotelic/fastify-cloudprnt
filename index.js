'use strict'

import pointOfView from 'point-of-view'
import nunjucks from 'nunjucks'

import pollRoute from './routes/main/post.js'
import getJobRoute from './routes/main/get.js'
import queueJobRoute from './routes/job/post.js'
import deleteJobRoute from './routes/job/delete.js'

async function fastifyCloudPrnt (fastify, options) {
  const defaultOptions = {
    getJob: () => null,
    getJobData: () => {},
    queueJob: () => false,
    deleteJob: () => false
  }

  const {
    getJob,
    getJobData,
    queueJob,
    deleteJob
  } = {
    ...defaultOptions,
    ...options
  }

  fastify.register(pointOfView, { engine: { nunjucks } })

  fastify.decorate('getJob', getJob)
  fastify.decorate('getJobData', getJobData)
  fastify.decorate('queueJob', queueJob)
  fastify.decorate('deleteJob', deleteJob)

  fastify.route(pollRoute)
  fastify.route(getJobRoute)
  fastify.route(queueJobRoute)
  fastify.route(deleteJobRoute)
}

export default fastifyCloudPrnt
