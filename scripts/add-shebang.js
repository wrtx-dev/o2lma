import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const distFilePath = join(process.cwd(), 'dist', 'index.js');
const shebang = '#!/usr/bin/env node\n';

if (!existsSync(distFilePath)) {
  console.error(`Error: ${distFilePath} not found. Please run 'npm run build' first.`);
  process.exit(1);
}

let content = readFileSync(distFilePath, 'utf-8');

// 检查是否已经存在shebang，避免重复添加
if (!content.startsWith(shebang.trim())) { // .trim() for just the shebang part
  content = shebang + content;
  writeFileSync(distFilePath, content, 'utf-8');
  console.log('Shebang added to ' + distFilePath);
} else {
  console.log('Shebang already present in ' + distFilePath);
}