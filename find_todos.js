const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      if(f !== 'node_modules' && f !== '.next' && f !== '.git') walkDir(dirPath, callback);
    } else {
      if(dirPath.endsWith('.ts') || dirPath.endsWith('.tsx')) callback(dirPath);
    }
  });
}

const results = [];
walkDir('T:\\Fiado-Canal-Digital', (filePath) => {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('TODO [EXTRACCION]')) {
      const nextLine = lines[i+1] ? lines[i+1].trim() : '';
      results.push({
        file: filePath.replace('T:\\Fiado-Canal-Digital\\', ''),
        todo: lines[i].trim(),
        import: nextLine
      });
    }
  }
});

console.log(JSON.stringify(results, null, 2));
