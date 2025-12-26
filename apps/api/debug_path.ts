
import * as path from 'path';
import * as fs from 'fs';

console.log('CWD:', process.cwd());
console.log('Resolved Path:', path.resolve(process.cwd(), '../web/public/products'));
console.log('Resolved Path exists:', fs.existsSync(path.resolve(process.cwd(), '../web/public/products')));
