'use strict'

import view from '@fastify/view'
import nunjucks from 'nunjucks'

import pollRoute from './routes/main/post.js'
import getJobRoute from './routes/main/get.js'
import queueJobRoute from './routes/job/post.js'
import deleteJobRoute from './routes/main/delete.js'

const defaultViewOptions = { engine: { nunjucks } }

export const defaultOptions = {
  getJob: () => null,
  getJobData: () => ({}),
  queueJob: () => false,
  deleteJob: () => false,
  viewOptions: defaultViewOptions
}

async function fastifyCloudPrnt (fastify, options = defaultOptions) {
  const {
    getJob,
    getJobData,
    queueJob,
    deleteJob,
    viewOptions
  } = {
    ...defaultOptions,
    ...options
  }

  fastify.register(view, {
    ...defaultViewOptions,
    ...viewOptions
  })

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
