jest.mock('../../src/configLoader', () => ({
  __esModule: true,
  default: jest.fn()
}));

import {join} from 'path';
import configLoader from '../../src/configLoader';
const getVueDependencyProvider = require('../../src/vue-dependency-provider');

const rootPath = join(__dirname, "..", "resources");


describe('vue-dependency-provider', () => {
  let provider;
  let actualDependencies;
  let vueFilePath;

  beforeEach(() => {
    (<jest.Mock>configLoader).mockImplementationOnce(() => ({
      "module-structure-lang-vue": {
        webpackConfig: 'test/resources/webpack.conf.js'
      }
    }));
  });

  test('getDependenciesFromInlineJavaScriptWithoutLangAttrib', () => {
    const expectedDependencies = [
      'module-a.js',
      'module-b.vue',
      'module-c.js',
      'module-d/index.js',
      'module-e.js',
      'module-f.vue'
    ];

    givenDependencyProvider();
    givenVueFile('sample_js.vue');
    whenGettingDependencies();
    thenActualDependenciesShouldMatch(expectedDependencies);
  });

  function givenDependencyProvider() {
    provider = getVueDependencyProvider();
  }

  function givenVueFile(fileName: string) {
    vueFilePath = join(rootPath, fileName);
  }

  function whenGettingDependencies() {
    actualDependencies = provider.getDependencies(vueFilePath, rootPath);
  }

  function thenActualDependenciesShouldMatch(expectedDependencies) {
    expect(actualDependencies).toEqual(expectedDependencies);
  }

  test('getDependenciesFromInlineTypeScriptWithoutLangAttrib', () => {
    const expectedDependencies = [
      'module-a.js',
      'module-b.vue',
      'module-c.js',
      'module-d/index.js',
      'module-e.js',
      'module-f.vue'
    ];

    givenDependencyProvider();
    givenVueFile('sample_ts.vue');
    whenGettingDependencies();
    thenActualDependenciesShouldMatch(expectedDependencies);
  })

  test('getDependenciesFromInlineJavaScriptWithLangAttrib', () => {
    const expectedDependencies = [
      'package-a/module-a.js',
      'package-a/module-b.js',
      'package-a/module-c.js',
      'package-b/module-d.js',
      'package-b/module-e.js',
      'package-b/module-f.js',
      'package-b/package-b2/module-g.js',
      'package-b/package-b2/module-h.js',
      'package-b/package-b2/module-i.js',
      'package-b/package-b2/module-j.js'
    ];

    givenDependencyProvider();
    givenVueFile('sample_lang_js.vue');
    whenGettingDependencies();
    thenActualDependenciesShouldMatch(expectedDependencies);
  })

  test('getDependenciesFromInlineTypeScriptWithLangAttrib', () => {
    const expectedDependencies = [
      'package-a/module-a.js',
      'package-a/module-b.js',
      'package-a/module-c.js',
      'package-b/module-d.js',
      'package-b/module-e.js',
      'package-b/module-f.js',
      'package-b/package-b2/module-g.js',
      'package-b/package-b2/module-h.js',
      'package-b/package-b2/module-i.js',
      'package-b/package-b2/module-j.js'
    ];

    givenDependencyProvider();
    givenVueFile('sample_lang_ts.vue');
    whenGettingDependencies();
    thenActualDependenciesShouldMatch(expectedDependencies);
  })

  test('getDependenciesFromExternalJavaScript', () => {
    const expectedDependencies = [ 'js/sample.js' ];

    givenDependencyProvider();
    givenVueFile('sample_src_js.vue');
    whenGettingDependencies();
    thenActualDependenciesShouldMatch(expectedDependencies);
  })

  test('getDependenciesFromExternalTypeScript', () => {
    const expectedDependencies = [ 'ts/sample.ts' ];

    givenDependencyProvider();
    givenVueFile('sample_src_ts.vue');
    whenGettingDependencies();
    thenActualDependenciesShouldMatch(expectedDependencies);
  })
});
