module.exports = {
  openapi: '3.0.0',
  info: {
    title: 'SQez API',
    version: '1.0.0',
    description: 'Minimal API for Render deployment.'
  },
  servers: [
    {
      url: '/'
    }
  ],
  paths: {
    '/api/health': {
      get: {
        summary: 'Health check',
        responses: {
          200: {
            description: 'API is healthy'
          }
        }
      }
    }
  }
}
