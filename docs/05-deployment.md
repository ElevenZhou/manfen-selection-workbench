# 服务器与部署方案

## 建议

采用一台可扩容的自有 Linux 服务器作为控制面和研究执行入口，至少拆分 Web/API、数据库、队列、研究适配器和执行器容器。Cloudflare 作为 DNS、TLS、WAF 和可选 CDN；不把长任务放进同步请求。

## 最小生产拓扑

```text
Caddy/Nginx :443
  ├─ web-api :3000
  ├─ worker-dispatcher
  ├─ worker-research
  ├─ executor-codex (sandbox)
  ├─ executor-opencode (sandbox)
  ├─ executor-hermes (sandbox)
  ├─ postgres :5432 (private)
  ├─ redis :6379 (private)
  └─ minio/R2 (private or signed URLs)
```

## 生产门禁

1. staging 与 production 使用不同数据库、对象存储前缀、密钥和域名。
2. 数据库迁移先备份，再在 staging 执行，读回 Schema 和计数。
3. Worker 先 dry-run，再开放小批量任务；通过 canary 后再放量。
4. 配置健康检查、队列积压、失败率、任务租约、磁盘、备份和 Feishu 回执告警。
5. 每个版本保存提交哈希、迁移编号、镜像摘要、健康检查与回滚命令。

## 是否使用服务器上的 Codex/OpenCode/Hermes

可以，但必须作为受控执行器：每个任务获得短期凭据、只读上下文和独立工作目录；输出以 JSON/文件产物回传；禁止执行器直接访问生产数据库、用户密钥或公网发布接口。研究适配器和执行器应该可单独停用，系统仍能查看历史报告和手工处理任务。

## 备份与回滚

- Postgres：每日全量 + WAL/增量，至少保留 14 天。
- 对象：版本化、校验和、异地/第二存储备份。
- Redis：不作为事实源，丢失后由任务表重建待处理队列。
- 回滚：应用镜像回滚、迁移 down/forward 修复、暂停新任务、保留审计和已完成产物。
