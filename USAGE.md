# 📁 文件管理使用说明

## 🎯 添加新的聊天记录文件

### 1. 文件格式要求
- 文件名格式：`YYYYMMDD.txt` 和 `YYYYMMDD.html`
- 例如：`20250623.txt`, `20250623.html`

### 2. 添加文件步骤

#### 方法一：本地开发环境
```bash
# 1. 将新文件放入 chatlogs 目录
cp your-new-file.txt chatlogs/20250623.txt
cp your-new-file.html chatlogs/20250623.html

# 2. 更新文件索引
npm run update-index

# 3. 提交到 GitHub
git add .
git commit -m "add: new chat logs for 2025-06-23"
git push origin main
```

#### 方法二：直接在 GitHub 上操作
1. 在 GitHub 仓库中进入 `chatlogs` 目录
2. 点击 "Add file" > "Upload files"
3. 拖拽你的 `.txt` 和 `.html` 文件
4. 手动编辑 `chatlogs/index.json`，在 `files` 数组中添加新文件名
5. 提交更改

### 3. 文件索引格式
`chatlogs/index.json` 文件格式：
```json
{
  "files": [
    "20250522.txt",
    "20250522.html",
    "20250623.txt",
    "20250623.html"
  ],
  "lastUpdated": "2025-05-29T12:44:42.274Z"
}
```

### 4. 查看新文件
1. 打开网站：https://peterli0228.github.io/wechat-summary/
2. 点击右上角的 **"刷新数据"** 按钮
3. 新的聊天记录会自动出现在列表中

## 🔧 自动化脚本

### 更新索引脚本
```bash
npm run update-index
```
这个脚本会：
- 扫描 `chatlogs` 目录中的所有文件
- 自动生成 `index.json` 文件
- 只包含符合 `YYYYMMDD.(txt|html)` 格式的文件

### 完整部署流程
```bash
# 添加新文件后的完整流程
npm run update-index  # 更新索引
npm run build        # 构建项目
git add .            # 添加所有更改
git commit -m "add new chat logs"  # 提交
git push origin main # 推送到 GitHub
```

## 📝 注意事项

1. **文件命名**：必须严格按照 `YYYYMMDD` 格式命名
2. **索引更新**：添加新文件后必须更新 `index.json`
3. **GitHub Pages**：推送后等待 1-2 分钟让 GitHub Pages 更新
4. **缓存清理**：如果看不到新文件，点击网页上的"刷新数据"按钮

## 🚀 快速添加文件模板

创建一个快速添加脚本 `add-chat-log.sh`：
```bash
#!/bin/bash
DATE=$1
if [ -z "$DATE" ]; then
  echo "Usage: ./add-chat-log.sh YYYYMMDD"
  exit 1
fi

# 复制文件到 chatlogs 目录
cp "${DATE}.txt" "chatlogs/${DATE}.txt"
cp "${DATE}.html" "chatlogs/${DATE}.html"

# 更新索引
npm run update-index

# 提交到 Git
git add .
git commit -m "add: chat logs for ${DATE}"
git push origin main

echo "✅ 聊天记录 ${DATE} 已成功添加并部署！"
```

使用方法：
```bash
chmod +x add-chat-log.sh
./add-chat-log.sh 20250623
``` 