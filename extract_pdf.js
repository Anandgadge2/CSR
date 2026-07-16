const fs = require('fs');
const zlib = require('zlib');
const b = fs.readFileSync('MahaCSR Portal Work Flow (3).pdf');
const s = b.toString('latin1');

let out = [];

// 1) Plain text in ( ) show operators
const plain = s.match(/\((?:[^()\\]|\\.)*\)/g) || [];
out.push('=== PLAIN TEXT TOKENS ===');
out.push(plain.map(x => x.slice(1, -1)).join(' '));

// 2) Decompress FlateDecode streams and pull text
out.push('\n=== DECOMPRESSED STREAM TEXT ===');
const re = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
let m;
while ((m = re.exec(s)) !== null) {
  const raw = Buffer.from(m[1], 'latin1');
  try {
    const inf = zlib.inflateSync(raw).toString('latin1');
    const toks = inf.match(/\((?:[^()\\]|\\.)*\)/g);
    if (toks && toks.length) {
      out.push(toks.map(x => x.slice(1, -1)).join(' '));
    }
    // also TJ array strings
    const tj = inf.match(/\[(?:[^\[\]])*\]\s*TJ/g);
  } catch (e) { /* not a flate stream */ }
}

fs.writeFileSync('pdf_text.txt', out.join('\n'));
console.log('done, bytes=' + out.join('\n').length);
