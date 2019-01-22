import * as compiler from 'vue-template-compiler';
import {readFileSync} from 'fs';
import {dirname, join, relative} from 'path';
import * as konan from 'konan';
import * as enhancedResolve from 'enhanced-resolve';
const {parse} = require('@vue/component-compiler-utils');
import configLoader from './configLoader';

export class VueDependencyProvider {

  private readonly myResolver;

  constructor() {
    this.myResolver = enhancedResolve.create.sync({
      extensions: ['.js'],
      alias: VueDependencyProvider.loadAlias(),
      modules: []
    });
  }

  private static loadAlias(): any {
    const config = configLoader();
    if(!config['module-structure-lang-vue'] || !config['module-structure-lang-vue'].webpackConfig) {
      return [];
    }
    const webpackConfigPath = join(process.cwd(), config['module-structure-lang-vue'].webpackConfig);
    const webpackConfig = require(webpackConfigPath);
    if(!webpackConfig.resolve || !webpackConfig.resolve.alias) {
      return []
    }
    return webpackConfig.resolve.alias;
  }

  public getDependencies(modulePath: string, rootDir: string): Array<string> {
    const source = readFileSync(modulePath, 'utf8');
    const {script} =  parse({source, compiler, needMap: false, sourceRoot: rootDir});
    if(!script) {
      return [];
    }
    const {content} = script;

    const {strings: imports} = konan(content);
    return imports
      .map(p => this.resolve(p, modulePath))
      .filter(p => p !== undefined);
  }

  private resolve(request, path) {
    try{
      const moduleDirectory = dirname(path);
      const absPath = this.myResolver(undefined, moduleDirectory, request);
      return relative(moduleDirectory, absPath);
    } catch {
      return undefined;
    }
  }
}

module.exports = function () {
  return new VueDependencyProvider();
};
