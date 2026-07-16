const fs = require('fs');
const path = require('path');

const files = [
  'src/controllers/reportController.ts',
  'src/controllers/csrLifecycleController.ts'
];

for (const relPath of files) {
  const filePath = path.join(__dirname, '..', relPath);
  if (!fs.existsSync(filePath)) continue;
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace req.user.XYZ with req.user?.XYZ
  const regex = /req\.user\.([a-zA-Z0-9_]+)/g;
  content = content.replace(regex, (match, prop) => {
    return `req.user?.${prop}`;
  });
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Fixed null checks in: ${relPath}`);
}
