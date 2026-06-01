const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

function replaceImg(filePath) {
  if (!filePath.endsWith('.tsx')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (content.includes('<img')) {
    // Add import if missing
    if (!content.includes('from "next/image"') && !content.includes("from 'next/image'")) {
      // Find last import
      const importMatches = [...content.matchAll(/^import /gm)];
      if (importMatches.length > 0) {
        const lastImportIndex = importMatches[importMatches.length - 1].index;
        const lineEnd = content.indexOf('\n', lastImportIndex);
        content = content.slice(0, lineEnd + 1) + 'import Image from "next/image";\n' + content.slice(lineEnd + 1);
      } else {
        content = 'import Image from "next/image";\n' + content;
      }
    }
    
    // Remove eslint-disable
    content = content.replace(/\/\* eslint-disable-next-line @next\/next\/no-img-element \*\/\n\s*/g, '');
    
    // Replace <img with <Image width={800} height={800}
    content = content.replace(/<img/g, '<Image width={800} height={800}');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Replaced in ${filePath}`);
  }
}

walkDir('./src', replaceImg);
