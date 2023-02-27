'use strict'

const fp = require('fastify-plugin')

const pollRoute = require('./routes/main/post.js')
const getJobRoute = require('./routes/main/get.js')
const queueJobRoute = require('./routes/job/post.js')
const deleteJobRoute = require('./routes/main/delete.js')

const defaultOptions = {
  getJob: async function () {
    return null
  },
  getJobData: async function () {
    return {}
  },
  queueJob: async function () {
    return false
  },
  deleteJob: async function () {
    return false
  }
}

async function fastifyCloudPrnt (fastify, options = defaultOptions) {
  const {
    getJob,
    getJobData,
    queueJob,
    deleteJob,
    routePrefix,
    templatesDir = '',
    routeOptions = {},
    defaultTemplate = 'receipt.stm',
    formatPrntCommandData
  } = {
    ...defaultOptions,
    ...options
  }

  const routes = [
    pollRoute,
    getJobRoute,
    queueJobRoute,
    deleteJobRoute
  ]

  await fastify.decorate('cloudPrnt', {
    getJob,
    getJobData,
    queueJob,
    deleteJob,
    templatesDir,
    defaultTemplate,
    formatPrntCommandData
  })

  fastify.register(async function (f) {
    routes.forEach(route => {
      f.route({
        ...routeOptions,
        ...route
      })
    })
  }, { prefix: routePrefix })
}

module.exports = fp(fastifyCloudPrnt, {
  name: 'fastify-plugin',
  decorators: ['view'],
  dependencies: ['point-of-view'],
  fastify: '3.x'
})
