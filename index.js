'use strict'

const fp = require('fastify-plugin')
const qs = require('fast-querystring')

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
    /**
     * Some requests that are sent through the Star Micronics CloudPRNT protocol may include "application/x-www-form-urlencoded" data.
     * As Fastify only natively supports 'application/json', we need to add an additional content-parser to handle requests with a
     * "application/x-www-form-urlencoded" content-type.
     */
    f.addContentTypeParser(
      'application/x-www-form-urlencoded',
      { parseAs: 'buffer' },
      function contentParser (req, body, done) {
        f.log.debug(
          `CloudPRNT request with "x-www-form-urlencoded" data received: ${req.method} ${req.url}\n` +
           body.toString()
        )
        done(null, qs.parse(body.toString()))
      }
    )
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
