import {existsSync} from 'fs';
import {join} from 'path';

export default function():Object {
  const configPath = join(process.cwd(), '.module-structure.js');
  return existsSync(configPath) ? require(configPath) : require('../conf/defaultConfig');
}
