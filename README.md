# WeChat-Summary - 微信群聊记录管理工具

一个现代化的微信群聊记录管理和分析工具，帮助您快速查看、搜索和分析群聊中的重要信息。

## ✨ 功能特色

### 🏠 首页 - 日期列表
- 📅 自动读取并展示所有聊天记录日期
- 📊 显示每日消息统计（消息数量、亮点数量）
- 🔄 支持数据刷新功能
- 🎯 点击日期快速跳转到聊天详情

### 💬 聊天详情页
- 📱 支持HTML和TXT两种格式的聊天记录
- 🖼️ HTML模式：完整渲染原始聊天记录样式
- 📝 TXT模式：结构化显示消息列表
- 🔍 实时搜索功能，按发送人或内容过滤
- 📈 支持跳转到汇总页面

### 🔍 智能搜索页
- 🎯 全局关键词搜索，支持所有聊天记录
- 📅 按日期范围筛选搜索结果
- 🌟 高亮显示匹配关键词
- 📖 显示搜索结果的上下文信息
- 📊 按日期分组展示搜索结果

### 📊 汇总页面
- 📈 智能分析每日聊天内容
- 🎯 提取重点信息和亮点
- 📋 生成聊天摘要

## 🛠️ 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite
- **路由管理**: React Router
- **UI组件**: shadcn/ui + Tailwind CSS
- **图标库**: Lucide React
- **状态管理**: TanStack Query
- **样式设计**: 小红书风格主题

## 📁 项目结构

```
WeChat-Summary/
├── public/
│   └── chatlogs/           # 聊天记录文件存储目录
│       ├── 20250526.html   # HTML格式聊天记录
│       └── 20250526.txt    # TXT格式聊天记录（用于搜索）
├── src/
│   ├── components/         # React组件
│   │   ├── ui/            # shadcn/ui组件
│   │   ├── Layout.tsx     # 布局组件
│   │   └── Navigation.tsx # 导航组件
│   ├── pages/             # 页面组件
│   │   ├── HomePage.tsx   # 首页
│   │   ├── ChatLogPage.tsx # 聊天详情页
│   │   ├── SearchPage.tsx # 搜索页
│   │   └── SummaryPage.tsx # 汇总页
│   ├── lib/               # 工具库
│   │   ├── chatUtils.ts   # 聊天记录工具函数
│   │   └── fileService.ts # 文件服务
│   └── hooks/             # React Hooks
└── data/                  # 原始数据文件
```

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 准备聊天记录文件

将您的聊天记录文件放置到 `public/chatlogs/` 目录下：

- **HTML文件**: 用于完整展示聊天记录（如：`20250526.html`）
- **TXT文件**: 用于搜索功能（如：`20250526.txt`）

文件命名格式：`YYYYMMDD.html` 和 `YYYYMMDD.txt`

### 3. 启动开发服务器

```bash
npm run dev
```

### 4. 访问应用

打开浏览器访问 `http://localhost:5173`

## 📝 文件格式说明

### TXT文件格式
```
发送者名称(wxid) 时间
消息内容

发送者名称(wxid) 时间
消息内容
```

示例：
```
井然(wxid_u165f6h4jeuq12) 00:38:34
大家好，我是井然，刚接触AI一个多月左右...

果潇洒-热心小白(guoguoxiaodian) 00:38:44
#举手  大家这种Vercel自动部署的网页，是怎么改名的啊
```

### HTML文件格式
支持任何有效的HTML格式，将通过iframe完整渲染。

## 🎨 设计特色

- 🌸 **小红书风格**: 采用粉色渐变主题，现代化设计
- 📱 **响应式设计**: 完美适配桌面端和移动端
- ✨ **流畅动画**: 丰富的交互动画效果
- 🎯 **用户友好**: 直观的操作界面和清晰的信息层次

## 🔧 自定义配置

### 添加更多聊天记录

1. 将新的HTML和TXT文件放入 `public/chatlogs/` 目录
2. 更新 `src/lib/fileService.ts` 中的 `knownFiles` 数组
3. 重启开发服务器

### 修改亮点检测关键词

编辑 `src/lib/chatUtils.ts` 中的 `detectHighlights` 函数：

```typescript
const highlightKeywords = ['分享', '推荐', '链接', 'https://', 'http://', '产品', '项目', '工具'];
```

## 📦 构建部署

```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 🤝 贡献指南

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [shadcn/ui](https://ui.shadcn.com/) - 优秀的UI组件库
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的CSS框架
- [Lucide](https://lucide.dev/) - 美观的图标库
- [Vite](https://vitejs.dev/) - 快速的构建工具

---

**享受您的群聊记录管理体验！** 🎉
