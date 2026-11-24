# 数据模型

## 主要表

| 表 | 作用 | 关键唯一键 |
| --- | --- | --- |
| `users` | 登录用户与身份 | `id`, `email` |
| `maintainer_profiles` | 技能、容量、可用性 | `user_id` |
| `selection_requests` | 用户发起的选品请求 | `idempotency_key` |
| `tasks` | 执行任务与状态 | `id` |
| `task_assignments` | 自动分派/认领历史 | `(task_id, version)` |
| `task_leases` | Worker 租约与心跳 | `task_id` |
| `reports` | 报告版本和来源 | `(report_id, version)` |
| `artifacts` | 证据、资料包、回执 | `sha256` |
| `audit_events` | 所有关键状态变化 | `id` |
| `feishu_deliveries` | 卡片请求与回执 | `idempotency_key` |

## 任务状态

```text
queued → claimed → processing → review → completed
  └──────────────→ blocked
  └──────────────→ cancelled
processing → stale → queued | blocked
```

禁止跳过审计事件的状态更新。每个状态事件包含操作者、时间、规则版本、原因、前值、后值和关联产物。

## API 草案

```text
POST /api/selection-requests
GET  /api/tasks?status=...
POST /api/tasks/:id/claim
POST /api/tasks/:id/release
POST /api/tasks/:id/heartbeat
POST /api/tasks/:id/complete
GET  /api/candidates?route=&form=&status=&assignee=
GET  /api/maintainers
PATCH /api/maintainers/:userId
POST /api/reports/:id/feishu
GET  /api/health
```

所有写 API 都需要身份、权限、幂等键、速率限制和审计；筛选参数不改变路线评分或历史报告。
