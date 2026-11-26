// Validate all JS modules can be parsed
const fs = require('fs');
const path = require('path');

function checkFile(f) {
  try {
    const code = fs.readFileSync(f, 'utf8');
    // Strip import/export statements for syntax check
    const stripped = code
      .replace(/import\s+[\s\S]*?from\s+['"].*?['"]\s*;?/g, '')
      .replace(/export\s+(const|let|var|function|class|default|async)/g, '$1');
    new Function(stripped);
    return null;
  } catch(e) {
    return e.message;
  }
}

const files = [];
function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (f.endsWith('.js')) files.push(p);
  }
}

walk(path.join(__dirname, '..', 'js'));

let errors = 0;
for (const f of files) {
  const err = checkFile(f);
  if (err) {
    console.log('ERROR ' + path.relative(__dirname, f) + ': ' + err);
    errors++;
  } else {
    console.log('OK ' + path.relative(__dirname, f));
  }
}
console.log(errors ? errors + ' errors' : 'All ' + files.length + ' files OK');
process.exit(errors ? 1 : 0);
