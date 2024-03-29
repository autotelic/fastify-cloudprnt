const test = require('ava')
const sinon = require('sinon')
const Fastify = require('fastify')
const view = require('@fastify/view')
const nunjucks = require('nunjucks')
const { promises: fs } = require('fs')

const fastifyCloudPrnt = require('./index.js')

const defaultViewOpts = { engine: { nunjucks } }

test('default options', async (t) => {
  const fastify = Fastify()

  fastify.register(view, defaultViewOpts)
  fastify.register(fastifyCloudPrnt)
  await fastify.ready()

  t.deepEqual(await fastify.cloudPrnt.getJobData(), {})
  t.is(await fastify.cloudPrnt.getJob(), null)
  t.false(await fastify.cloudPrnt.queueJob())
  t.false(await fastify.cloudPrnt.deleteJob())
})

test('client poll, no job ready', async (t) => {
  const fastify = Fastify()

  fastify.register(view, defaultViewOpts)
  fastify.register(fastifyCloudPrnt)
  await fastify.ready()

  const response = await fastify.inject({
    method: 'POST',
    url: '/',
    body: {
      statusCode: '200 OK'
    }
  })

  t.deepEqual(response.json(), { jobReady: false })
})

test('client poll, job ready', async (t) => {
  const jobToken = 'ABC123'
  const fastify = Fastify()

  fastify.register(view, defaultViewOpts)
  fastify.register(fastifyCloudPrnt, {
    getJob: () => jobToken
  })
  await fastify.ready()

  const response = await fastify.inject({
    method: 'POST',
    url: '/',
    body: {
      statusCode: '200 OK'
    }
  })

  t.deepEqual(response.json(), {
    jobReady: true,
    jobToken: 'ABC123',
    mediaTypes: [
      'application/vnd.star.starprntcore'
    ]
  })
})

test('get job, success', async (t) => {
  const jobToken = 'ABC123'
  const fastify = Fastify()

  fastify.register(view, defaultViewOpts)
  fastify.register(fastifyCloudPrnt, {
    getJobData: (token) => ({ token }),
    templatesDir: 'examples/templates/'
  })

  await fastify.ready()

  const response = await fastify.inject({
    method: 'GET',
    url: `/?token=${jobToken}`
  })

  t.is(response.statusCode, 200)
  t.is(response.statusMessage, 'OK')
  t.is(response.headers['content-type'], 'application/vnd.star.starprntcore')
  t.true(response.body.includes('Receipt'))

  // assert the rendered stm file is deleted
  const err = await t.throwsAsync(fs.access('/tmp/ABC123.stm'))
  t.is(err.code, 'ENOENT')
})

test('get job, not found', async (t) => {
  const jobToken = 'ABC123'
  const fastify = Fastify()

  fastify.register(view, defaultViewOpts)
  fastify.register(fastifyCloudPrnt, {
    getJobData: (token) => null
  })
  await fastify.ready()

  const response = await fastify.inject({
    method: 'GET',
    url: `/?token=${jobToken}`
  })

  t.is(response.statusCode, 404)
  t.is(response.headers['content-type'], 'text/plain; charset=utf-8')
})

test('get job, should merge templatesDir with templateName if present', async (t) => {
  const jobToken = '123ABC'

  const fastify = Fastify()

  fastify.register(view, defaultViewOpts)
  fastify.register(fastifyCloudPrnt, {
    getJobData: (token) => ({ template: 'autotelic.stm', token }),
    templatesDir: 'examples/templates/'
  })

  await fastify.ready()

  const response = await fastify.inject({
    method: 'GET',
    url: `/?token=${jobToken}`
  })

  t.is(response.statusCode, 200)
  t.is(response.statusMessage, 'OK')
  t.is(response.headers['content-type'], 'application/vnd.star.starprntcore')
  t.true(response.body.includes('Autotelic'))
})

test('get job, should use the configured formatPrntCommandData', async (t) => {
  const jobToken = 'ABC123'
  const fastify = Fastify()

  const formatPrntCommandData = sinon.spy()
  fastify.register(view, defaultViewOpts)

  fastify.register(fastifyCloudPrnt, {
    getJobData: (token) => ({ token }),
    formatPrntCommandData,
    templatesDir: 'examples/templates/'
  })

  await fastify.ready()
  const viewSpy = sinon.spy(fastify, 'view')

  const response = await fastify.inject({
    method: 'GET',
    url: `/?token=${jobToken}`
  })

  const renderedReceipt = await viewSpy.lastCall.returnValue
  t.true(formatPrntCommandData.calledWith(renderedReceipt))
  t.is(response.statusCode, 200)
})

test('delete job, success', async (t) => {
  const token = 'ABC123'
  const fastify = Fastify()

  const deleteJob = sinon.stub().returns(true)

  fastify.register(view, defaultViewOpts)
  fastify.register(fastifyCloudPrnt, { deleteJob })
  await fastify.ready()

  const response = await fastify.inject({
    method: 'DELETE',
    url: `/?token=${token}`
  })

  t.true(deleteJob.calledWith(token))
  t.is(response.statusCode, 200)
  t.deepEqual(response.json(), { token })
})

test('delete job, not found', async (t) => {
  const token = 'ABC123'
  const fastify = Fastify()

  const deleteJob = sinon.stub().returns(false)

  fastify.register(view, defaultViewOpts)
  fastify.register(fastifyCloudPrnt, { deleteJob })
  await fastify.ready()

  const response = await fastify.inject({
    method: 'DELETE',
    url: `/?token=${token}`
  })

  t.true(deleteJob.calledWith(token))
  t.is(response.statusCode, 404)
  t.deepEqual(response.json(), { token })
})

test('queue job', async (t) => {
  const token = 'ABC123'
  const jobData = { foo: 'bar' }
  const fastify = Fastify()

  const queueJob = sinon.spy()

  fastify.register(view, defaultViewOpts)
  fastify.register(fastifyCloudPrnt, { queueJob })
  await fastify.ready()

  const response = await fastify.inject({
    method: 'POST',
    url: '/job',
    body: {
      token,
      jobData
    }
  })

  t.true(queueJob.calledWith(token, jobData))
  t.is(response.statusCode, 201)
  t.deepEqual(response.json(), { token })
})

test('should throw an error if @fastify/view is not registered', async t => {
  const fastify = Fastify()
  const register = async () => {
    await fastify.register(fastifyCloudPrnt)
  }
  await t.throwsAsync(register)
})

test('should prefix routes when supplied with a routePrefix opt', async t => {
  const token = 'ABC123'
  const jobData = { foo: 'bar' }
  const prefix = '/test'
  const fastify = Fastify()

  const queueJob = sinon.spy()

  fastify.register(view, defaultViewOpts)
  fastify.register(fastifyCloudPrnt, {
    queueJob,
    routePrefix: prefix
  })
  await fastify.ready()

  const withPrefixResponse = await fastify.inject({
    method: 'POST',
    url: `${prefix}/job`,
    body: {
      token,
      jobData
    }
  })

  t.true(queueJob.calledWith(token, jobData))
  t.is(withPrefixResponse.statusCode, 201)

  const noPrefixResponse = await fastify.inject({
    method: 'POST',
    url: '/job',
    body: {
      token,
      jobData
    }
  })

  t.is(noPrefixResponse.statusCode, 404)
})

test('should use the configured defaultTemplate', async (t) => {
  const jobToken = 'XYZ123'

  const fastify = Fastify()

  fastify.register(view, defaultViewOpts)
  fastify.register(fastifyCloudPrnt, {
    getJobData: (token) => ({ token }),
    templatesDir: 'examples/templates/',
    defaultTemplate: 'autotelic.stm'
  })

  await fastify.ready()

  const response = await fastify.inject({
    method: 'GET',
    url: `/?token=${jobToken}`
  })

  t.is(response.statusCode, 200)
  t.is(response.statusMessage, 'OK')
  t.is(response.headers['content-type'], 'application/vnd.star.starprntcore')
  t.true(response.body.includes('Autotelic'))
  t.false(response.body.includes('Receipt'))
})

test('should use the configured routerOpts', async (t) => {
  const fastify = Fastify()
  const handlerCalls = []
  fastify.register(view, defaultViewOpts)
  fastify.register(fastifyCloudPrnt, {
    routeOptions: {
      preValidation: async function (req, reply) {
        handlerCalls.push('preValidation')
      },
      preHandler: async function (req, reply) {
        handlerCalls.push('preHandler')
        throw new Error('preHandler error')
      },
      errorHandler: async function (err, req, reply) {
        handlerCalls.push('errorHandler')
        reply
          .code(200)
          .send(err.message)
      }
    }
  })

  await fastify.ready()

  const response = await fastify.inject({
    method: 'GET',
    url: '/?token=foo'
  })

  t.is(response.statusCode, 200)
  t.is(response.statusMessage, 'OK')
  t.is(response.body, 'preHandler error')
  t.deepEqual(handlerCalls, ['preValidation', 'preHandler', 'errorHandler'])
})

test('should use the default errorhHandler if not configured', async (t) => {
  const fastify = Fastify()

  fastify.register(view, defaultViewOpts)
  fastify.register(fastifyCloudPrnt, {
    getJobData: async function () {
      throw new Error('test error')
    }
  })

  await fastify.ready()

  const response = await fastify.inject({
    method: 'GET',
    url: '/?token=foo'
  })

  t.is(response.statusCode, 500)
  t.is(response.statusMessage, 'Internal Server Error')
})

test('should not error if request includes x-www-form-urlencoded data', async (t) => {
  const token = 'ABC123'
  const fastify = Fastify()

  const deleteJob = sinon.stub().returns(true)

  fastify.register(view, defaultViewOpts)
  fastify.register(fastifyCloudPrnt, { deleteJob })
  await fastify.ready()

  const response = await fastify.inject({
    method: 'DELETE',
    url: `/?token=${token}`,
    headers: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    body: Buffer.from('foo=bar')
  })

  t.true(deleteJob.calledWith(token))
  t.is(response.statusCode, 200)
  t.deepEqual(response.json(), { token })
})
