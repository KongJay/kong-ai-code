# Kong AI Code - AI代码生成平台

基于 Spring Boot 3 + LangChain4j + React 开发的 **AI代码生成平台**，支持智能代码生成、可视化编辑、一键部署等功能。

## 项目介绍

这是一个企业级 AI 代码生成平台，主要功能包括：

### 核心功能

1. **智能代码生成**：用户输入需求描述，AI 自动分析并选择合适的生成策略，通过工具调用生成代码文件，采用流式输出让用户实时看到 AI 的执行过程。

2. **可视化编辑**：生成的应用将实时展示，可以进入编辑模式，自由选择网页元素并且和 AI 对话来快速修改页面，直到满意为止。

3. **一键部署分享**：可以将生成的应用一键部署到云端并自动截取封面图，获得可访问的地址进行分享，同时支持完整项目源码下载。

4. **企业级管理**：提供用户管理、应用管理、系统监控、业务指标监控等后台功能，管理员可以设置精选应用、监控 AI 调用情况和系统性能。

## 技术栈

### 后端
- Spring Boot 3.5.4
- Java 21
- LangChain4j - AI 应用开发
- LangGraph4j - AI 工作流
- MyBatis Flex - ORM框架
- Spring Cloud Alibaba - 微服务
- Redis - 缓存
- MySQL - 数据库

### 前端
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui

## 项目结构

```
kong-ai-code/
├── src/main/java/com/jaychou/kongaicode/  # 后端源码
│   ├── ai/                                # AI服务相关
│   ├── controller/                        # 控制器
│   ├── service/                           # 业务服务
│   ├── langgraph4j/                       # AI工作流
│   └── ...
├── kong-ai-code-react/                    # 前端项目
└── sql/                                   # 数据库脚本
```

## 快速开始

### 环境要求
- JDK 21+
- Maven 3.6+
- Node.js 18+
- MySQL 8.0+
- Redis 6.0+

### 后端启动

1. 创建数据库并执行 `sql/create_table.sql`

2. 配置 `src/main/resources/application.yml` 和 `application-local.yml`

3. 运行主类 `KongAiCodeApplication`

### 前端启动

```bash
cd kong-ai-code-react
npm install
npm run dev
```

访问 http://localhost:3000

## 功能模块

- 用户管理：注册、登录、权限管理
- 应用管理：创建、编辑、删除应用
- AI代码生成：HTML、多文件、Vue项目等
- 可视化编辑：实时编辑生成的代码
- 应用部署：一键部署到云端
- 系统监控：AI调用监控、性能监控

## 许可证

MIT License
