import * as compiler from 'vue-template-compiler';
import {readFileSync} from 'fs';
import {dirname, join, relative} from 'path';
import * as konan from 'konan';
import * as enhancedResolve from 'enhanced-resolve';
import configLoader from './configLoader';

const {parse} = require('@vue/component-compiler-utils');
import fs = require("fs");
import path = require("path");

const preconditions = require("preconditions").instance();
const checkArgument = preconditions.checkArgument;

/**
 *  Simple implementation to allow processing of TypeScript/ES6 modules - necessary because
 *  TypeScript compiler output cannot be used since it removes even "important" imports.
 */
class ImportsProvider {
    private static readonly COMMENT_REGEXP = /(\/\*([^*]|[\r\n]|(\*+([^*\/]|[\r\n])))*\*+\/)|(\/\/.*)/g;
    private static readonly IMPORT_REGEXP = /import(?:["'\s]*([\w*{\s*}\n, ]+)from\s*)?["'\s]*([@\w\/\._-]+)["'\s]*;?;/g;


    public getImportsFromFile(modulePath: string): Array<string> {
        checkArgument(fs.existsSync(modulePath) && fs.statSync(modulePath).isFile());
        let moduleAsString = fs.readFileSync(modulePath, "utf-8");

        return this.getImportsFromString(moduleAsString);
    }

    public getImportsFromString(moduleAsString: string): Array<string> {
        const moduleAsStringWithoutComments = this.removeComments(moduleAsString);
        return this.findImportSources(moduleAsStringWithoutComments);
    }

    private removeComments(str: string): string {
        return this.replaceAll(str, ImportsProvider.COMMENT_REGEXP, "");
    }

    private replaceAll(str: string, searchValue: RegExp, replaceValue: string): string {
        let length = str.length;
        str = str.replace(searchValue, replaceValue);
        return str.length === length ? str : this.replaceAll(str, searchValue, replaceValue);
    }

    private findImportSources(moduleString: string): Array<string> {
        let matches = ImportsProvider.match(moduleString, ImportsProvider.IMPORT_REGEXP);
        return matches
            .filter(match => match.length === 3)
            .map(match => {
                const path = match[2];
                return path.endsWith(".vue") || path.endsWith(".ts")
                    ? path
                    : path + ".ts";
            });
    }

    private static match(str: string, regExp: RegExp): Array<RegExpExecArray> {
        let match: RegExpExecArray;
        let matches: Array<RegExpExecArray> = [];

        while ((match = regExp.exec(str)) !== null) {
            // This is necessary to avoid infinite loops with zero-width matches
            if (match.index === regExp.lastIndex) {
                regExp.lastIndex++;
            }

            matches.push(match);
        }

        return matches;
    }
}

export class VueDependencyProvider {

    private readonly myResolver;
    private readonly importsProvider = new ImportsProvider();

    constructor() {
        this.myResolver = enhancedResolve.create.sync({
            extensions: ['.js'],
            alias: VueDependencyProvider.loadAlias(),
            modules: []
        });
    }

    private static loadAlias(): any {
        const config = configLoader();
        if (!config['module-structure-lang-vue'] || !config['module-structure-lang-vue'].webpackConfig) {
            return [];
        }
        const webpackConfigPath = join(process.cwd(), config['module-structure-lang-vue'].webpackConfig);
        const webpackConfig = require(webpackConfigPath);
        if (!webpackConfig.resolve || !webpackConfig.resolve.alias) {
            return []
        }
        return webpackConfig.resolve.alias;
    }

    public getDependencies(modulePath: string, rootDir: string): Array<string> {
        const fileExtension = path.extname(modulePath);
        if (fileExtension === ".ts" || fileExtension === ".js") {
            return this.importsProvider.getImportsFromFile(modulePath);
        } else if (fileExtension === ".vue") {
            return this.getImportsFromVueFile(modulePath, rootDir);
        } else {
            throw Error(`Unhandled file extension ${fileExtension}`);
        }
    }

    private getImportsFromVueFile(modulePath: string, rootDir: string) {
        const source = readFileSync(modulePath, 'utf8');
        const {script} = parse({source, compiler, needMap: false, sourceRoot: rootDir});
        if (!script) {
            return [];
        }

        if (script.lang === "ts" || script.lang === "js") {
            let imports = new Array<string>();
            if (script.src) {
                imports.push(script.src);
            }
            imports.concat(this.importsProvider.getImportsFromString(script.content));
            return imports;
        }

        const {content} = script;
        const {strings: imports} = konan(content);
        return imports
            .map(p => this.resolve(p, modulePath))
            .filter(p => p !== undefined);
    }

    private resolve(request, path) {
        try {
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
