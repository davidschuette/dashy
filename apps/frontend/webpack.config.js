// Helper for combining webpack config objects
const { merge } = require('webpack-merge')

module.exports = (config, context) => {
  return merge(config, {
    resolve: {
      preferRelative: true,
      alias: {
        '@nestjs/swagger': 'node_modules/@nestjs/swagger/dist/extra/swagger-shim.js',
      },
    },
  })
}
