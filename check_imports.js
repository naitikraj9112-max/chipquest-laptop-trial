// Quick module-import smoke test via dynamic import simulation
const fs = require('fs');
const path = require('path');

// Check all JS files for export/import mismatches
const files = [];
function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (f.endsWith('.js')) files.push(p);
  }
}
walk('js');

// Collect all exports and imports
const exportMap = {};
const importErrors = [];

for (const file of files) {
  const src = fs.readFileSync(file, 'utf8');
  const relPath = file.replace(/\\/g, '/');
  
  // Find exports
  const exportMatches = src.matchAll(/export\s+(?:const|let|var|function|class|async\s+function)\s+(\w+)/g);
  const defaultExport = src.match(/export\s+default/);
  exportMap[relPath] = [...exportMatches].map(m => m[1]);
  if (defaultExport) exportMap[relPath].push('default');
  
  // Find imports
  const importMatches = src.matchAll(/import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/g);
  for (const m of [...importMatches]) {
    const names = m[1].split(',').map(s => s.trim());
    const from = m[2];
    
    // Resolve relative path
    const dir = path.dirname(file);
    const resolved = path.resolve(dir, from).replace(/\\/g, '/');
    const resolvedRel = path.relative('.', resolved).replace(/\\/g, '/');
    
    // Check if the target file exports what we're importing
    if (exportMap[resolvedRel]) {
      for (const name of names) {
        if (!exportMap[resolvedRel].includes(name)) {
          importErrors.push(${relPath}: imports '' from '' but  does not export it. Available: );
        }
      }
    }
  }
}

if (importErrors.length > 0) {
  console.log('IMPORT ERRORS:');
  importErrors.forEach(e => console.log('  ❌ ' + e));
} else {
  console.log('All import/export bindings look OK');
}

// Check if audio modules have correct exports
console.log('\naudio/music.js exports:', exportMap['js/audio/music.js']);
console.log('audio/sfx.js exports:', exportMap['js/audio/sfx.js']);
console.log('audio/audio.js exports:', exportMap['js/audio/audio.js']);
console.log('core/state.js exports:', exportMap['js/core/state.js']);
