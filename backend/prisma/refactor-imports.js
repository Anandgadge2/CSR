const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src');

function getRelativePath(fromFile, toFile) {
  let relative = path.relative(path.dirname(fromFile), toFile);
  relative = relative.replace(/\\/g, '/');
  if (!relative.startsWith('.')) {
    relative = './' + relative;
  }
  return relative.replace(/\.ts$/, '');
}

function processDirectory(directory) {
  const items = fs.readdirSync(directory);
  for (const item of items) {
    const fullPath = path.join(directory, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (stat.isFile() && item.endsWith('.ts')) {
      processFile(fullPath);
    }
  }
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Pattern 1: import { Role } from "@prisma/client";
  const p1 = /import\s+\{\s*Role\s*\}\s*from\s*["']@prisma\/client["'];?/g;
  if (p1.test(content)) {
    const relPath = getRelativePath(filePath, path.join(srcDir, 'types/role.ts'));
    content = content.replace(p1, `import { Role } from "${relPath}";`);
    modified = true;
  }

  // Pattern 2: import { ..., Role, ... } from "@prisma/client";
  const p2 = /import\s+\{([^}]+)\}\s*from\s*["']@prisma\/client["'];?/g;
  content = content.replace(p2, (match, imports) => {
    if (imports.includes('Role')) {
      const cleanedImports = imports
        .split(',')
        .map(i => i.trim())
        .filter(i => i !== 'Role' && i !== '')
        .join(', ');
      
      const relPath = getRelativePath(filePath, path.join(srcDir, 'types/role.ts'));
      modified = true;

      const prismaClientImport = cleanedImports 
        ? `import { ${cleanedImports} } from "@prisma/client";\n` 
        : '';
      return `${prismaClientImport}import { Role } from "${relPath}";`;
    }
    return match;
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated imports in: ${filePath}`);
  }
}

console.log("Starting import refactoring...");
processDirectory(srcDir);
console.log("Import refactoring completed!");
