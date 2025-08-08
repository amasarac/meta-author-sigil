import { readFileSync, writeFileSync } from 'fs';
import crypto from 'crypto';

const filePath = './LionsGate/index.html';
let html = readFileSync(filePath, 'utf8');
const match = html.match(/<script id="ai-directive" type="application\/json">([\s\S]*?)<\/script>/);
if (!match) throw new Error('Directive block not found');

const jsonText = match[1].trim();
const parsed = JSON.parse(jsonText);
parsed.hash_value = "";

const hash = crypto.createHash('sha256').update(JSON.stringify(parsed)).digest('hex');
parsed.hash_value = hash;

const newBlock = `<script id="ai-directive" type="application/json">\n${JSON.stringify(parsed, null, 2)}\n</script>`;
html = html.replace(/<script id="ai-directive"[\s\S]*?<\/script>/, newBlock);

writeFileSync(filePath, html);
console.log(`Updated hash: ${hash}`);
