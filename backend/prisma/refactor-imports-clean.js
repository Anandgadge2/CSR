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

function cleanFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let lines = content.split('\n');
  let hasPrismaRole = false;
  let prismaLineIndex = -1;
  
  // Find if there is an import from @prisma/client containing Role
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('from "@prisma/client"') || line.includes("from '@prisma/client'")) {
      if (line.includes('Role')) {
        hasPrismaRole = true;
        prismaLineIndex = i;
        break;
      }
    }
  }
  
  if (hasPrismaRole && prismaLineIndex !== -1) {
    let line = lines[prismaLineIndex];
    const match = line.match(/import\s*\{\s*([^}]+)\s*\}\s*from/);
    if (match) {
      const imports = match[1].split(',').map(s => s.trim());
      const filteredImports = imports.filter(s => s !== 'Role' && s !== '');
      if (filteredImports.length > 0) {
        lines[prismaLineIndex] = line.replace(/import\s*\{[^}]+\}\s*from/, `import { ${filteredImports.join(', ')} } from`);
      } else {
        lines[prismaLineIndex] = ''; // remove entire line if Role was the only import
      }
      
      const relPath = getRelativePath(filePath, path.join(srcDir, 'types/role.ts'));
      lines.splice(prismaLineIndex + 1, 0, `import { Role } from "${relPath}";`);
      
      content = lines.join('\n');
      
      // Remove any existing duplicate imports of types/role
      const escapedPath = relPath.replace(/\./g, '\\.').replace(/\//g, '\\/');
      const duplicateRegex = new RegExp(`import\\s*\\{\\s*Role\\s*\\}\\s*from\\s*["']${escapedPath}["'];?\\r?\\n`, 'g');
      content = content.replace(duplicateRegex, '');
      
      // Clean up any remaining multiple empty roles
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Cleanly refactored imports in: ${filePath}`);
    }
  }
}

function processDirectory(directory) {
  const items = fs.readdirSync(directory);
  for (const item of items) {
    const fullPath = path.join(directory, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (stat.isFile() && item.endsWith('.ts')) {
      cleanFile(fullPath);
    }
  }
}

console.log("Starting clean imports refactoring...");
processDirectory(srcDir);
console.log("Clean imports refactoring completed!");
