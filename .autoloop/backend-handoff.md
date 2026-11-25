# 后端任务队列交接

## 完成内容

- 新增 `apps/selection-web/lib/selectionRequests.ts`，集中处理任务表、事件审计、幂等创建、租约领取、租约回收、状态更新和任务读取。
- `POST/GET /api/selection-requests` 支持幂等键、任务详情、状态筛选、事件回放，并在读取时回收过期租约。
- `POST /api/selection-requests/claim` 支持 worker 标识和 15 分钟租约，领取结果包含 `lease_id`。
- `POST /api/selection-requests/heartbeat` 支持处理中任务续租。
- `POST /api/selection-requests/update` 支持 `claimed → processing → review/completed/blocked/failed/cancelled` 等状态写回，并拒绝已完成任务回退与错误租约。
- `scripts/selection-worker.mjs` 现在会以 worker ID 领取任务，进入 `processing`，定时续租，并在终态写回租约和审计上下文。

## 验证

- `npm test` 通过，13/13 测试通过。
- `node --check scripts/selection-worker.mjs` 通过。
- `npm run build` 通过，构建包含新的 heartbeat API。

## 已知边界

- 认证与角色授权仍依赖现有应用入口，队列 API 目前没有新增 OIDC 中间件。
- 真实 D1、Worker 常驻进程和外部 Feishu/研究服务需要部署环境回执，未在本地伪造完成。
- `npx tsc --noEmit` 仍受仓库既有 Cloudflare 类型声明和页面隐式 any 问题影响，未由本次后端改动引入的构建阻断；生产构建正常。
