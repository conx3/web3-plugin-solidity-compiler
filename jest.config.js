/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
  verbose: true,
  moduleNameMapper: {
    // '^axios$': require.resolve('axios'),
    'axios': 'axios/dist/node/axios.cjs'
  },
  testTimeout: 999999,
  roots: [
    'test',
    // comment the next line when testing for breaking changes, if those the changes where not published yet
    'test-package'
  ]
};

module.exports = config;