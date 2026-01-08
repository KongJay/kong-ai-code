# Kong AI Code - React前端

基于React + Next.js + shadcn/ui构建的AI代码生成平台前端。

## 技术栈

- **框架**: Next.js 14
- **语言**: TypeScript
- **UI库**: shadcn/ui + Radix UI
- **样式**: Tailwind CSS
- **状态管理**: Zustand
- **HTTP客户端**: Axios
- **Markdown渲染**: React Markdown
- **代码高亮**: React Syntax Highlighter

## 功能特性

### 用户功能
- 🔐 用户注册登录
- 👤 用户个人中心
- 📱 响应式设计
- 🌙 深色模式支持

### 应用管理
- ➕ 创建应用
- ✏️ 编辑应用信息
- 📋 应用列表浏览
- 🔍 应用搜索筛选

### AI对话
- 🤖 AI对话式代码生成
- 💬 实时聊天界面
- 📥 代码下载功能
- 📝 Markdown渲染
- 🎨 代码语法高亮

### 管理功能
- 👥 用户管理（管理员）
- 📊 应用管理（管理员）
- 💬 聊天记录管理（管理员）
- 🔒 权限控制

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

创建 `.env.local` 文件：

```env
# API基础URL - 后端服务地址
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080

# 可选配置
NEXT_PUBLIC_APP_NAME=Kong AI Code
NEXT_PUBLIC_APP_DESCRIPTION=AI驱动的代码生成平台
```

环境变量说明：
- `NEXT_PUBLIC_API_BASE_URL`: 后端API服务的基础URL
- `NEXT_PUBLIC_APP_NAME`: 应用名称（可选）
- `NEXT_PUBLIC_APP_DESCRIPTION`: 应用描述（可选）

### 3. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 查看应用。

### 4. 构建生产版本

```bash
npm run build
npm start
```

## 项目结构

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # 首页
│   ├── apps/              # 应用相关页面
│   ├── app/               # 应用详情页面
│   ├── user/              # 用户相关页面
│   ├── globals.css        # 全局样式
│   └── layout.tsx         # 根布局
├── api/                   # API接口
├── components/            # 组件
│   └── ui/               # shadcn/ui组件
├── lib/                  # 工具库
├── store/                # 状态管理
└── types/                # TypeScript类型定义
```

## 主要页面

### 前台页面
- `/` - 首页
- `/user/login` - 用户登录
- `/user/register` - 用户注册
- `/profile` - 用户个人中心
- `/apps` - 应用列表
- `/app/create` - 创建应用
- `/app/edit/[id]` - 编辑应用
- `/app/chat/[id]` - 应用聊天页面

### 管理后台
- `/admin/users` - 用户管理
- `/admin/apps` - 应用管理
- `/admin/chats` - 聊天管理

## API接口

项目通过RESTful API与后端通信，主要接口包括：

- 用户管理：登录、注册、用户信息
- 应用管理：应用CRUD、部署、下载
- 聊天功能：AI对话、代码生成

## 开发说明

### 添加新的shadcn/ui组件

```bash
npx shadcn@latest add [component-name]
```

### 代码规范

- 使用TypeScript进行类型检查
- 遵循ESLint配置
- 使用Prettier格式化代码

## 部署

### 开发环境

1. 安装依赖：
```bash
npm install
```

2. 配置环境变量（见快速开始部分）

3. 启动开发服务器：
```bash
npm run dev
```

### 生产环境

1. 构建生产版本：
```bash
npm run build
```

2. 启动生产服务器：
```bash
npm start
```

## 常见问题

### Q: 如何修改API地址？
A: 修改 `.env.local` 文件中的 `NEXT_PUBLIC_API_BASE_URL` 变量。

### Q: 如何添加新的页面？
A: 在 `src/app` 目录下创建新的路由文件夹，Next.js会自动识别路由。

### Q: 如何自定义样式？
A: 项目使用Tailwind CSS，可以直接在组件中使用Tailwind类名，或修改 `src/app/globals.css`。

### Q: 如何添加新的shadcn/ui组件？
A: 运行 `npx shadcn@latest add [component-name]` 来添加新的组件。

### Q: 如何处理API错误？
A: API错误统一在 `src/lib/request.ts` 的响应拦截器中处理，UI层面会显示错误提示。

## 许可证

MIT License
