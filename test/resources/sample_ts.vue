<template>
    <div></div>
</template>
<script>
import moduleA from './module-a';
import moduleB from './module-b.vue';
import moduleC = require('./module-c.js');
import moduleD from './module-d';
import moduleE from 'aliasModuleE';
import moduleF from 'aliasModuleF';
import {parse} from '@vue/component-compiler-utils';
import fs = require('fs');

@Component
export default class Foo extends Vue {
    private someField: SomeClass;
}
</script>
