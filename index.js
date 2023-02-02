'use strict'

const fp = require('fastify-plugin')

const pollRoute = require('./routes/main/post.js')
const getJobRoute = require('./routes/main/get.js')
const queueJobRoute = require('./routes/job/post.js')
const deleteJobRoute = require('./routes/main/delete.js')

const defaultOptions = {
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
    routePrefix,
    templatesDir = '',
    defaultTemplate = 'receipt.stm'
  } = {
    ...defaultOptions,
    ...options
  }

  fastify.decorate('cloudPrnt', {
    getJob,
    getJobData,
    queueJob,
    deleteJob,
    templatesDir,
    defaultTemplate
  })

  fastify.register(async function (f) {
    f.route(pollRoute)
    f.route(getJobRoute)
    f.route(queueJobRoute)
    f.route(deleteJobRoute)
  }, { prefix: routePrefix })
}

module.exports = fp(fastifyCloudPrnt, {
  name: 'fastify-plugin',
  decorators: ['view'],
  dependencies: ['point-of-view']
})
