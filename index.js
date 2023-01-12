'use strict'

import fp from 'fastify-plugin'

import pollRoute from './routes/main/post.js'
import getJobRoute from './routes/main/get.js'
import queueJobRoute from './routes/job/post.js'
import deleteJobRoute from './routes/main/delete.js'

export const defaultOptions = {
  getJob: () => null,
  getJobData: () => ({}),
  queueJob: () => false,
  deleteJob: () => false
}

async function fastifyCloudPrnt (fastify, options = defaultOptions) {
  const {
    getJob,
    getJobData,
    queueJob,
    deleteJob,
    routePrefix
  } = {
    ...defaultOptions,
    ...options
  }

  fastify.decorate('cloudPrnt', {
    getJob,
    getJobData,
    queueJob,
    deleteJob
  })

  fastify.register(async function (f) {
    f.route(pollRoute)
    f.route(getJobRoute)
    f.route(queueJobRoute)
    f.route(deleteJobRoute)
  }, { prefix: routePrefix })
}

export default fp(fastifyCloudPrnt, {
  name: 'fastify-plugin',
  decorators: ['view'],
  dependencies: ['@fastify/view']
})
