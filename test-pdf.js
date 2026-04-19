import fs from 'fs';
import pdfParse from 'pdf-parse';

const buffer = fs.readFileSync('package.json');
console.log(buffer.length);
