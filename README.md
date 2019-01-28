# module-structure-lang-vue


<a href="https://www.npmjs.com/package/module-structure-lang-vue"><img alt="npm Version" src="https://img.shields.io/npm/v/module-structure-lang-vue.svg"></a>

Vue language provider for <a href="https://www.npmjs.com/package/module-structure">module-structure</a>. 

See <a href="https://www.npmjs.com/package/module-structure">module-structure</a> for full documentation.

## Installation

This  extension is optional and not bundled with module-structure, therefore requires separate installation. Local and global installation is supported.

After installation of this extension, it is automatically detected by module-structure and used for analyzing Vue single file component dependencies.


## Config
To set custom settings, create a **.module-structure.js** in your root folder, like .eslintrc.js or babel.config.js.
Add the config parameter under the key "module-structure-lang-vue"

Example: 
<pre><code>
module.exports = {
 'module-structure-lang-vue': {
   webpackConfig: "path/to/your/project/webpack/config.js"
 }
};
</code></pre>

Config parameter:
<table align="center">
    <tr>
        <td>webpackConfig</td>
        <td align="right">
            Use the webpack config to resolve webpack aliases.
        </td>
    </tr>
</table>

## Credits

<table align="center">
    <tr>
        <td>@vue/component-compiler-utils</td>
        <td align="right">
            <a href="https://www.npmjs.com/package/@vue/component-compiler-utils">homepage</a>
            &nbsp;-&nbsp;
            <a href="http://spdx.org/licenses/MIT">show license</a>
        </td>
    </tr>
    <tr>
        <td>enhanced-resolve</td>
        <td align="right">
            <a href="https://www.npmjs.com/package/enhanced-resolve">homepage</a>
            &nbsp;-&nbsp;
            <a href="http://spdx.org/licenses/MIT">show license</a>
        </td>
    </tr>
    <tr>
        <td>konan</td>
        <td align="right">
            <a href="https://www.npmjs.com/package/konan">homepage</a>
            &nbsp;-&nbsp;
            <a href="http://spdx.org/licenses/MIT">show license</a>
        </td>
    </tr>
    <tr>
        <td>vue-template-compiler</td>
        <td align="right">
            <a href="https://www.npmjs.com/package/vue-template-compiler">homepage</a>
            &nbsp;-&nbsp;
            <a href="http://spdx.org/licenses/MIT">show license</a>
        </td>
    </tr>
    
</table>

## License

MIT