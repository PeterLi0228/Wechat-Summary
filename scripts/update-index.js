#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 获取chatlogs目录路径
const chatlogsDir = path.join(__dirname, '../chatlogs');
const indexFile = path.join(chatlogsDir, 'index.json');

try {
  // 读取chatlogs目录中的所有文件
  const files = fs.readdirSync(chatlogsDir)
    .filter(file => {
      // 只包含txt和html文件，且符合日期格式 YYYYMMDD
      return (file.endsWith('.txt') || file.endsWith('.html')) && 
             /^\d{8}\.(txt|html)$/.test(file);
    })
    .sort(); // 按文件名排序

  // 创建索引对象
  const index = {
    files: files,
    lastUpdated: new Date().toISOString()
  };

  // 写入索引文件
  fs.writeFileSync(indexFile, JSON.stringify(index, null, 2));
  
  console.log(`✅ 索引文件已更新: ${files.length} 个文件`);
  console.log('📁 文件列表:');
  files.forEach(file => console.log(`   - ${file}`));
  
} catch (error) {
  console.error('❌ 更新索引文件失败:', error.message);
  process.exit(1);
} 