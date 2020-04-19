<template>
    <div></div>
</template>
<script>
import moduleA from './module-a';
import moduleB from './module-b.vue';
const moduleC = require('./module-c.js');
import moduleD from './module-d';
import moduleE from 'aliasModuleE';
import moduleF from 'aliasModuleF';
import {parse} from '@vue/component-compiler-utils';
const fs = require('fs');

class Rectangle {
  constructor(height, width) {
      this.height = height;
      this.width = width;
  }
  // Getter
  get area() {
      return this.calcArea();
  }
  // Method
  calcArea() {
      return this.height * this.width;
  }
}

const square = new Rectangle(10, 10);
</script>
