#!/bin/bash

echo "🚀 快速添加聊天记录文件"
echo "================================"

# 检查是否有文件参数
if [ $# -eq 0 ]; then
    echo "❌ 请拖拽文件到此脚本上，或者提供文件路径"
    echo "用法: ./quick-add.sh file1.txt file2.html"
    exit 1
fi

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
CHATLOGS_DIR="$PROJECT_DIR/chatlogs"

echo "📁 项目目录: $PROJECT_DIR"
echo "📂 聊天记录目录: $CHATLOGS_DIR"

# 处理每个文件
for file in "$@"; do
    if [ ! -f "$file" ]; then
        echo "❌ 文件不存在: $file"
        continue
    fi
    
    filename=$(basename "$file")
    
    # 检查文件名格式
    if [[ ! $filename =~ ^[0-9]{8}\.(txt|html)$ ]]; then
        echo "⚠️  文件名格式不正确: $filename"
        echo "   应该是 YYYYMMDD.txt 或 YYYYMMDD.html 格式"
        continue
    fi
    
    # 复制文件
    cp "$file" "$CHATLOGS_DIR/$filename"
    echo "✅ 已复制: $filename"
done

echo ""
echo "🔄 更新文件索引..."
cd "$PROJECT_DIR"
npm run update-index

echo ""
echo "🏗️  构建项目..."
npm run build

echo ""
echo "📋 复制构建文件..."
cp dist/index.html .
cp dist/404.html .
rm -rf assets/
cp -r dist/assets .
cp chatlogs/index.json .

echo ""
echo "📤 提交到 GitHub..."
git add .
git commit -m "add: new chat logs $(date +%Y-%m-%d)"
git push origin main

echo ""
echo "🎉 完成！新文件已添加并部署到 GitHub Pages"
echo "🌐 网站: https://peterli0228.github.io/wechat-summary/"
echo "⏰ 等待 1-2 分钟后刷新网页即可看到新文件" 