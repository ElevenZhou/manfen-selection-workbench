# 系统架构

可视化图：[新版本架构图 SVG](architecture-v2.svg) · [可编辑 Mermaid 源文件](architecture-v2.mmd)

## 推荐形态

生产使用自有服务器上的 Docker Compose 或等价编排，Cloudflare 只承担 DNS、TLS、CDN/WAF 和可选的边缘缓存。系统的状态、队列和长任务都由自己的服务持有，避免把常驻 Worker、浏览器或本地模型误塞进页面请求。

```text
Browser
  ↓ HTTPS / OIDC
Reverse Proxy (Caddy/Nginx)
  ├─ Web + API (Next.js)
  ├─ Postgres (system of record)
  ├─ Redis (queue / lease / rate limit)
  ├─ Object Storage (S3/MinIO/R2)
  ├─ Dispatcher Worker
  │    ├─ research-adapter
  │    ├─ codex-adapter
  │    ├─ opencode-adapter
  │    └─ hermes-adapter
  └─ Metrics / Logs / Backup
```

## 请求边界

- 浏览器只调用 API；不接触 Feishu Webhook、模型 Token、商店凭证或 Shell。
- API 只创建任务、读取状态和提交用户操作；长研究通过 Queue/Worker 异步执行。
- Dispatcher 负责事务锁、容量计算、租约、重试和状态推进。
- Research Adapter 负责证据收集协议；Executor Adapter 负责把已批准的步骤交给 Codex/OpenCode/Hermes。
- 每次执行都使用独立工作区、命令白名单、预算和超时；禁止在生产容器中任意安装依赖或读取宿主机密钥。

## 执行器定位

| 执行器 | 适合任务 | 约束 |
| --- | --- | --- |
| Codex | 计划拆解、证据综合、代码审查、结构化报告 | 只返回结构化结果；不可直接发布 |
| OpenCode | 可重复的代码修改、测试和小范围重构 | 独立 worktree；变更需测试与审计 |
| Hermes | 长时研究编排、候选扩展、后台批处理 | 预算、来源、重试和人工复核门禁 |

## 可靠性

- Postgres 使用迁移、唯一键、事务和每日备份。
- Redis 只保存短期队列与租约；任务事实以 Postgres 为准。
- Worker 采用 at-least-once；所有外部写入使用幂等键，不能把重复投递当成成功。
- 租约默认 15 分钟，心跳每 60 秒；超时进入 `stale`，管理员或回收器重派。
- 全局熔断条件：错误率、成本、积压、数据库连接或 Feishu 连续失败超过阈值。
