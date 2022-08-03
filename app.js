async function pluginApp (fastify, options) {
  fastify.get('/', async function (req, reply) {
    return { hello: 'world' }
  })
}

export default pluginApp
