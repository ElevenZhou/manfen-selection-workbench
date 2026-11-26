# 一小时全量测试线记录

测试日期：2026-11-27（Asia/Singapore）
测试范围：当前本地版本 `apps/selection-web`
测试地址：`http://localhost:3000`
测试方式：生产构建、静态测试、lint、Vinext 本地服务、Playwright 浏览器与页面内 API 冒烟

## 总结

结果：通过，发现并修复 2 个移动端横向溢出问题。

- `npm test`：18/18 通过，生产构建通过。
- `npm run lint`：通过，0 warning、0 error。
- 主要页面 HTTP 与浏览器访问：全部 200。
- 任务创建、幂等、领取、租约续期、状态推进、失败重试、错误租约拒绝：冒烟通过。
- 最新案例商店素材、YouTube iframe 和设计库入口：可访问。

## 页面冒烟

以下页面均通过本地浏览器内 `fetch` 和页面渲染检查，状态均为 `200`，并包含 `#main-content`。

`/`、`/reports`、`/candidates`、`/packages`、`/research`、`/schedule`、`/design`、`/projects`、`/prompts`、`/ingest`、`/selector`

重点页面检查结果：

- `/selector` 有启动表单、状态筛选、任务刷新和空状态。
- `/candidates` 移动宽度 390px 时无横向溢出。
- `/projects` 移动宽度 390px 时无横向溢出，列表加载失败有重试入口。
- `/projects/mu-01` 移动宽度 390px 时无横向溢出，保留状态选择、回填表单、YouTube 证据和 10 个输入控件。
- `/design` 移动宽度 390px 时无横向溢出，设计入口可访问。
- `/` 移动宽度 390px 时无横向溢出。最新案例 iframe 为 `https://www.youtube.com/embed/zgBze7IAdXQ`，标题存在，尺寸为 294×220。

## API 与任务状态冒烟

通过页面内 `fetch` 执行，避免绕过本地浏览器运行环境。

### 创建与幂等

- 首次 `POST /api/selection-requests` 返回 `202`，状态 `queued`。
- 相同 `idempotencyKey` 再次提交返回 `200`、`reused: true`，任务 ID 相同。

### 租约与状态推进

- `POST /api/selection-requests/claim` 返回 `200`，任务进入 `claimed` 并生成 `lease_id`。
- 正确 worker 调用 heartbeat 返回 `200`，租约到期时间更新。
- `claimed → processing → review → completed` 全部返回 `200`。
- 详情 GET 返回 `completed`，事件包含 `created`、`claimed` 和状态变更记录。

### 错误租约与失败重试

- 错误 `lease_id` 的 heartbeat 返回 `409`。
- 错误 `lease_id` 的状态更新返回 `409`。
- `claimed → failed` 返回 `200`，`failed → queued` 重试返回 `200`，再次领取返回 `claimed`。
- 从 `claimed` 直接跳到 `completed` 返回 `409`，符合状态机约束。完整重试链已验证到再次领取，终态需先推进到 `processing`。
- 冒烟测试产生的非终态测试任务已通过 API 标记为 `cancelled`。本地测试报告任务仍保留用于审计读取，未触碰生产数据。

### 未等待的场景

- 15 分钟租约自然过期与自动回收未等待实时时间完成，已有静态测试和 Worker 回收实现覆盖。生产前仍应在 staging 用可缩短 TTL 的测试配置演练一次。
- Feishu 真实发送、外部研究适配器和正式 D1 未在本地伪造成功，当前只验证了服务端路由和本地绑定行为。

## 本轮修复

- `apps/selection-web/app/globals.css`
  - 修复选品启动页移动端 `.selector-grid` 横向溢出，强制移动端网格布局并限制表单子项最小宽度。
  - 修复制作档案详情移动端 hero 轻微横向溢出，使 390px 视口的 `scrollWidth` 回到 390px。

## 复现命令

```bash
cd /Users/xmm/projects/满分选品系统/apps/selection-web
npm test
npm run lint
npm run dev -- --host 127.0.0.1
```

浏览器检查使用 Playwright CLI 打开 `http://localhost:3000`，再在 390×844 与桌面视口检查页面和 iframe。
