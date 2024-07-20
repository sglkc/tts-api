import Fastify from 'fastify'
import main from './index.js'

const app = Fastify()

app.route({
  method: ['GET', 'POST'],
  url: '/',
  handler: async (req) => {
    let body = req.body

    if (typeof body === 'string') {
      try { body = JSON.parse(req.body) } catch (e) {}
    }

    const payload = Object.assign({}, body, req.query)

    return await main(payload)
  }
})

app.listen({ port: process.env.PORT || 3000 })
  .then(console.log)
  .catch(console.error)
