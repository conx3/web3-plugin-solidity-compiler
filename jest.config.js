/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
  verbose: true,
  moduleNameMapper: {
    // '^axios$': require.resolve('axios'),
    'axios': 'axios/dist/node/axios.cjs'
  },
  testTimeout: 99999,
};

module.exports = config;