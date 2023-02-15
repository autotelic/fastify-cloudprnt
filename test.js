const test = require('ava')
const sinon = require('sinon')
const Fastify = require('fastify')
const view = require('point-of-view')
const nunjucks = require('nunjucks')
const { promises: fs } = require('fs')

const fastifyCloudPrnt = require('./index.js')

const defaultViewOpts = { engine: { nunjucks } }

test('default options', async (t) => {
  const fastify = Fastify()

  fastify.register(view, defaultViewOpts)
  fastify.register(fastifyCloudPrnt)
  await fastify.ready()

  t.deepEqual(fastify.cloudPrnt.getJobData(), {})
  t.is(fastify.cloudPrnt.getJob(), null)
  t.false(fastify.cloudPrnt.queueJob())
  t.false(fastify.cloudPrnt.deleteJob())
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

test('should use the configured errorHandler', async (t) => {
  const fastify = Fastify()

  fastify.register(view, defaultViewOpts)
  fastify.register(fastifyCloudPrnt, {
    errorHandler: function (err, req, reply) {
      reply
        .code(200)
        .send(err.message)
    },
    getJobData: async function () {
      throw new Error('test error')
    }
  })

  await fastify.ready()

  const response = await fastify.inject({
    method: 'GET',
    url: '/?token=foo'
  })

  t.is(response.statusCode, 200)
  t.is(response.statusMessage, 'OK')
  t.is(response.body, 'test error')
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
