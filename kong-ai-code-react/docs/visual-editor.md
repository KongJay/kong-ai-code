# 可视化编辑（iframe 选中元素）从 0 到 1：一篇给“只有前端基础”的实战教程

> 目标：学会在父页面里放一个 `iframe` 预览网页，开启“编辑模式”后在 iframe 内 **悬浮高亮**、**点击选中**任意元素，并把选中元素的信息（选择器、文本、位置等）回传给父页面用于后续编辑/AI 改代码。
>
> 本文完全基于当前项目实现：`src/lib/visualEditor.ts` + `src/app/app/chat/[id]/page.tsx` + 后端 `StaticResourceController`。

---

## 你需要具备的最少知识

- 会用 `addEventListener` 监听 DOM 事件（click/mouseover/mouseout）
- 知道什么是 `iframe`
- 知道什么是“同源/跨域”（协议 + 域名 + 端口三者任意不同即跨域）
- 会读一点 TypeScript（本项目用 TS）

---

## 这个功能的“总体架构”

一句话：**父页面负责“开关 + 注入 + 收结果”，iframe 页面负责“高亮 + 选中 + 发结果”。**

### 父页面做什么？

- 维护编辑模式状态（是否在编辑）
- 让 `VisualEditor` 知道要控制哪个 iframe（`init(iframe)`）
- 开启编辑时，把“编辑脚本”注入到 iframe 内（同源时直接注入；跨域时通过 `postMessage` 注入）
- 监听 `window.message`，接收 iframe 发回的 `ELEMENT_SELECTED` 消息，从而得到“你选中了哪个元素”

### iframe 页面做什么？

被注入的脚本会：

- 给 `document.body` 加事件监听器
  - `mouseover`：给元素加 `.edit-hover`（蓝色虚线框）
  - `click`：阻止默认行为、清理旧选中、给目标元素加 `.edit-selected`（绿色实线框）
- 构建元素信息（tag、id、class、text、selector、rect、pagePath…）
- `window.parent.postMessage({ type: 'ELEMENT_SELECTED', data: { elementInfo } }, '*')` 发回父页面
- 同时也监听父页面的 `TOGGLE_EDIT_MODE` / `CLEAR_SELECTION` / `CLEAR_ALL_EFFECTS` 指令

---

## 关键文件导航（建议你先打开看一遍）

- **核心类**：`src/lib/visualEditor.ts`
- **使用方（父页面）**：`src/app/app/chat/[id]/page.tsx`
- **预览 iframe**：`src/app/components/app/PreviewPanel.tsx`（里面有 `<iframe className="preview-iframe" ... />`）
- **跨域接收器（后端注入）**：`src/main/java/com/jaychou/kongaicode/controller/StaticResourceController.java`

---

## 第 1 部分：父页面如何开启/关闭编辑模式

### 1.1 VisualEditor 的职责

`VisualEditor` 不是 UI 组件，它是一个“控制器”：

- 你把 iframe 传给它，它负责把脚本注入到 iframe，并通过消息控制 iframe 的行为。
- 你通过 options 传入回调（如 `onElementSelected`），它负责在收到 iframe 消息时调用回调。

### 1.2 `toggleEditMode()` 为什么是关键

你点按钮时调用 `toggleEditMode()`。

正确的 `toggleEditMode()` 必须做两件事之一：

- **开启编辑**：触发注入（或激活）脚本
- **关闭编辑**：清理 iframe 内的 hover/selected/tip 等状态

本项目修复点：`toggleEditMode()` 现在会真实调用 `enableEditMode()` / `disableEditMode()`，而不是只改一个布尔值。

### 1.3 父页面如何接收“选中结果”

父页面会：

1. `window.addEventListener('message', handleMessage)`
2. `handleMessage` 里调用 `visualEditor.handleIframeMessage(event)`
3. `handleIframeMessage` 根据 `event.data.type` 触发回调

当 iframe 选中元素时，会发：

- `type: 'ELEMENT_SELECTED'`
- `data: { elementInfo: ... }`

父页面拿到后就能显示“当前选中的元素信息”，并把它拼进 prompt 里让 AI 知道你要改哪一块。

---

## 第 2 部分：真正的核心——如何把脚本注入到 iframe

### 2.1 同源 vs 跨域：决定了你能不能直接注入

#### 同源（推荐）

父页面可以直接访问：

- `iframe.contentDocument`
- `iframe.contentWindow`

于是你可以：

1. `contentDocument.createElement('script')`
2. 把“编辑脚本字符串”塞进 `script.textContent`
3. `head.appendChild(script)`

这就是 `visualEditor.ts` 的“同源注入路径”。

#### 跨域（现实中更常见）

父页面**不能**访问 `iframe.contentDocument`，否则要么报 `SecurityError`，要么 `contentDocument` 永远是 `null`。

跨域时唯一标准方式是：

- 父页面：`iframe.contentWindow.postMessage({ type: 'INJECT_SCRIPT', script }, '*')`
- iframe 页面：提前注册 `window.addEventListener('message', ...)`，收到 `INJECT_SCRIPT` 后执行 `script`

这就是所谓的“接收器脚本（receiver snippet）”。

### 2.2 为什么你项目里“后端接收器”能解决跨域？

你预览页面是通过后端 `/api/static/.../index.html` 提供的，这个服务和 Next 前端通常不是同源（端口不同）。

因此：

- 前端无法同源注入
- 必须走 `postMessage`
- iframe 内必须存在接收器脚本

为保证“任何生成的 HTML 都能支持可视化编辑”，项目在 `StaticResourceController` 对 `.html` 响应做了“自动注入接收器脚本”。

这是一种工程化做法：**不要求 AI 生成的页面每次都记得写接收器**，后端统一兜底。

---

## 第 3 部分：iframe 里的编辑脚本到底做了什么

编辑脚本是 `visualEditor.ts` 里 `generateEditScript()` 返回的一段 IIFE（自执行函数）。

它主要包含 5 块逻辑：

### 3.1 注入样式（高亮效果）

- `.edit-hover`：hover 时蓝色虚线框
- `.edit-selected`：选中时绿色实线框

这样做的好处：不需要改业务页面代码，纯靠 class 就能显示“编辑态”。

### 3.2 监听事件（mouseover/mouseout/click）

关键点：

- 监听加在 `document.body` 上，使用捕获阶段（第三个参数 `true`），这样更容易抢到事件
- `click` 里 `preventDefault + stopPropagation`：防止页面跳转、按钮提交、链接打开等副作用
- 会过滤掉 `SCRIPT/STYLE` 等不该选的元素
- 做了容错：`event.target` 不一定是 `Element`，必须先判断

### 3.3 生成“元素唯一定位”（selector）

思路：

1. 从当前元素向上回溯到 `body`
2. 如果有 `id`：直接用 `#id` 并停止（通常 id 足够唯一）
3. 否则拼接：
   - tagName
   - class（过滤掉 `edit-*`）
   - `:nth-child(n)` 用于区分兄弟节点
4. 最终得到类似：

`div.container:nth-child(2) > button.primary:nth-child(1)`

这不是“完美唯一选择器”，但对“把元素描述给 AI/定位大概区域”很够用。

### 3.4 收集 ElementInfo 并发回父页面

通过 `getBoundingClientRect()` 获取：

- top/left/width/height

并带上：

- tagName / id / className / textContent（截断到 100）
- selector
- pagePath（search + hash）

最后：

`window.parent.postMessage({ type: 'ELEMENT_SELECTED', data: { elementInfo } }, '*')`

### 3.5 监听父页面命令（开关/清理）

iframe 脚本会监听：

- `TOGGLE_EDIT_MODE`：开/关编辑态
- `CLEAR_SELECTION`：清理 `.edit-selected`
- `CLEAR_ALL_EFFECTS`：彻底退出编辑态（包括 tip）

父页面只需要发消息，不需要再直接操作 iframe DOM。

---

## 第 4 部分：最常见的坑（你踩到的就是第一个）

### 4.1 “点了编辑但选不中”——99% 是注入没成功

原因组合拳：

- `toggleEditMode()` 只改状态，没注入
- 跨域导致 `contentDocument` 访问失败
- 跨域时 `contentDocument` 可能不是抛异常，而是一直 `null`，代码会“卡在轮询里”

本项目的解决方式：

- `toggleEditMode()` 真正调用 enable/disable
- 注入逻辑增加**超时回退**：一定时间内 doc 不可用就改走 `postMessage INJECT_SCRIPT`
- 后端保证 HTML 一定有接收器脚本（跨域必需）

### 4.2 Next 资源 404（`/_next/static/...`）

你看到的 `/_next/static/... 404` 说明：预览服务不是 Next server，无法提供 Next 的构建产物。

如果你生成的是 Next 工程，这个预览方式不适合（除非你做 `next export` 或把 `_next` 等产物也部署出来并配置正确的 basePath）。

建议：预览尽量生成纯静态（HTML/CSS/JS）或 Vue dist 这种可静态托管的产物。

### 4.3 安全注意事项（非常重要）

跨域注入的本质是：

- iframe 接收消息后执行 `new Function(script)()`

这等同于“远程代码执行”，只能用于：

- 可信任的环境（本地/内网）
- 受控的消息来源

生产环境建议至少做：

- 验证 `event.origin`（只允许来自你的前端域名）
- message 里加 token/nonce
- 或彻底改成同源（反代把预览也挂到同域名下）

---

## 第 5 部分：你可以如何自己从 0 实现一个最小版本（练手）

> 下面是练习路线，不需要改项目也能理解思路。

### Step A：父页面

- 放一个 iframe：`<iframe src="..." />`
- 写一个按钮：点击后向 iframe 发 `TOGGLE_EDIT_MODE`
- 监听 `window.message`，打印 `ELEMENT_SELECTED`

### Step B：iframe 页面

- 写接收器：收到 `INJECT_SCRIPT` 执行脚本
- 或者直接在 iframe 页里写一段“编辑脚本”
- 点击元素时 `postMessage` 发回父页面

做到这一步，你就掌握了本项目的核心机制。

---

## 第 6 部分：如何调试（建议照着做）

### 6.1 父页面看日志

在浏览器控制台观察：

- 是否打印了 `enableEditMode -> injectEditScript`
- 是否打印了 `fallback to postMessage INJECT_SCRIPT`

### 6.2 iframe 页面是否真的收到了消息？

最简单：

- 在接收器里 `console.log(event.data)`（开发期）

或者在 DevTools 的 “Frames” 里切换到 iframe 执行：

- `window.addEventListener('message', console.log)`

### 6.3 是否真的绑定了事件监听？

在 iframe 控制台执行：

- 鼠标 hover 一个元素，看是否出现 `.edit-hover`
- 点击后看是否出现 `.edit-selected`

---

## FAQ

### Q1：后端注入接收器是必须的吗？

- 同源：不必须。
- 跨域：**必须要有某种形式的接收器**（后端注入、生成时写入、或你自己手动写），否则父页面无法把脚本注入 iframe。

### Q2：为什么不用浏览器插件/Shadow DOM？

可以，但本项目追求“纯前端 + 纯脚本注入 + 低侵入”，iframe + postMessage 是最通用的方案之一。

---

## 建议你接下来阅读的源码顺序

1. `src/app/app/chat/[id]/page.tsx`：看“按钮如何触发编辑、如何接收选中结果”
2. `src/lib/visualEditor.ts`：看“注入/回退/脚本内容”
3. `StaticResourceController.java`：看“为什么跨域时需要接收器兜底”


