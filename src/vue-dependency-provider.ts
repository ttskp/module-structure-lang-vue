import * as compiler from 'vue-template-compiler';
import {readFileSync} from 'fs';
import {dirname, join, relative} from 'path';
import * as konan from 'konan';
import * as enhancedResolve from 'enhanced-resolve';
const {parse} = require('@vue/component-compiler-utils');
import configLoader from './configLoader';
import {
    AST_NODE_TYPES as TYPESCRIPT_NODE_TYPES,
    parse as parseTypeScript}
    from '@typescript-eslint/typescript-estree';
import {Literal, TSExternalModuleReference} from "@typescript-eslint/typescript-estree/dist/ts-estree/ts-estree";
import {SFCBlock} from "@vue/component-compiler-utils/lib/parse";


export class VueDependencyProvider {

    private readonly myResolver;
    private readonly regex = new RegExp('\\\\', 'g');

    constructor() {
        this.myResolver = enhancedResolve.create.sync({
            extensions: ['.ts', '.js'],
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
        let imports = [];

        const script = VueDependencyProvider.getScriptFrom(modulePath, rootDir);
        if (script) {
            imports = this.getImportsFrom(script);
        }

        return this.processImports(imports, modulePath);
    }

    private static getScriptFrom(modulePath: string, rootDir: string): SFCBlock | null {
        const source = readFileSync(modulePath, 'utf8');
        const output = parse({source, compiler, needMap: false, sourceRoot: rootDir});

        return output.script;
    }

    private getImportsFrom(script: SFCBlock) {
        let imports = [];

        if (script.src) {
            imports.push(script.src);
        }
        else if (script.lang === "ts") {
            imports = VueDependencyProvider.getImportsFromInlineTypescript(script.content);
        }
        else if (script.lang === "js") {
            imports = VueDependencyProvider.getImportsFromInlineJavaScript(script.content);
        }
        else {
            imports = VueDependencyProvider.getImportsFromUndefinedInlineScript(script.content);
        }

        return imports;
    }

    private static getImportsFromInlineTypescript(content: string): string[] {
        const tree = parseTypeScript(content);
        let imports = [];
        for (let statement of tree.body) {
            if (statement.type === TYPESCRIPT_NODE_TYPES.ImportDeclaration) {
                imports.push(statement.source.value);
            }
            else if (statement.type === TYPESCRIPT_NODE_TYPES.TSImportEqualsDeclaration) {
                const moduleReference = statement.moduleReference as TSExternalModuleReference;
                if (moduleReference.expression.type === TYPESCRIPT_NODE_TYPES.Literal) {
                    const expression = moduleReference.expression as Literal;
                    imports.push(expression.value);
                }
            }
        }

        return imports;
    }

    private static getImportsFromInlineJavaScript(content: string): string[] {
        return konan(content).strings;
    }

    private static getImportsFromUndefinedInlineScript(content: string): string[] {
        try {
            return VueDependencyProvider.getImportsFromInlineJavaScript(content);
        }
        catch {
            return VueDependencyProvider.getImportsFromInlineTypescript(content);
        }
    }

    private processImports(imports: string[], modulePath: string): string[] {
        return imports
            .map(p => this.resolve(p, modulePath))
            .filter(p => p !== undefined)
            .map(dep => dep.replace(this.regex, '/'));
    }

    private resolve(request, path): string {
        try{
            const moduleDirectory = dirname(path);
            const absPath = this.myResolver(undefined, moduleDirectory, request);
            return relative(moduleDirectory, absPath);
        }
        catch {
            return undefined;
        }
    }
}

module.exports = function () {
    return new VueDependencyProvider();
};
