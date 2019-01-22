jest.mock('../../src/configLoader', () => ({
  __esModule: true,
  default: jest.fn()
}));

import {join, resolve} from 'path';
import configLoader from '../../src/configLoader';
const getVueDependencyProvider = require('../../src/vue-dependency-provider');

const rootPath = join(__dirname, "..", "resources");

describe('vue-dependency-provider', () => {
  test('getDependencies', () => {
    (<jest.Mock>configLoader).mockImplementationOnce(() => ({
      "module-structure-lang-vue": {
        webpackConfig: 'test/resources/webpack.conf.js'
      }
    }));

    const provider = getVueDependencyProvider();

    const expectedDependencies = [
      'module-a.js',
      'module-b.vue',
      'module-c.js',
      'module-d/index.js',
      'module-e.js',
      'module-f.vue'
    ];

    const regex = new RegExp('\\\\', 'g');
    const actualDependencies = provider.getDependencies(join(rootPath, 'sample.vue'), rootPath)
      .map(dep => dep.replace(regex, '/'));

    expect(actualDependencies).toEqual(expectedDependencies);
  })
});
