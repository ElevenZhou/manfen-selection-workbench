# 生产服务器配置与部署基线

## 目标

本配置支持选品网站、任务队列、游戏观察 Harness、Hermes 编排器和 DeepSeek 模型网关在可回滚、可审计的环境中运行。它是生产基线和 staging 检查表，不代表服务器、DNS、模型账号或外部 Webhook 已经配置完成。

## 推荐拓扑

```text
Internet
  │ 443 only
Cloudflare DNS / WAF / TLS
  │
Caddy reverse proxy
  ├─ web-api                 :3000  internal
  ├─ dispatcher              internal
  ├─ observation-worker      internal
  ├─ review-worker           internal
  ├─ hermes-runner           internal, sandboxed
  ├─ model-gateway           internal
  ├─ postgres                :5432 internal only
  ├─ redis                   :6379 internal only
  ├─ minio or S3/R2          :9000 internal or signed URLs
  └─ metrics/log collector   internal
```

浏览器只访问 Caddy 的 HTTPS 入口。模型供应商 Token、Feishu Webhook、OIDC Secret、数据库密码和对象存储密钥只注入服务环境，不进入前端、镜像层、任务产物或日志。Hermes、Worker 和模型网关不暴露公网端口。

## 起步资源配置

下表是 10 个账号、每日约 100 个常规任务和少量游戏观察任务的起步估算。它需要通过 staging 压测校准，不能当作性能承诺。

| 节点 | 起步配置 | 部署内容 | 说明 |
| --- | --- | --- | --- |
| 控制节点 | 4 vCPU、8 GB RAM、100 GB SSD | Caddy、Web/API、Dispatcher、Model Gateway、监控 Agent | 不运行模型推理和长时采集 |
| 观察节点 | 8 vCPU、16 GB RAM、200 GB SSD | Observation Worker、抽帧/转写工具、Review Worker | 限制并发，工作目录使用独立卷 |
| 数据节点 | 4 vCPU、16 GB RAM、300 GB SSD | Postgres、Redis、备份 Agent | 数据库和 Redis 只在内网监听 |
| 可选推理节点 | 8–16 vCPU、32 GB RAM、24 GB 以上显存的 GPU | DeepSeek 自托管推理 | 只在模型体积、延迟和成本验证后启用 |

预算有限时可以先合并控制节点和观察节点，但必须保留容器资源上限、独立工作目录和队列租约。DeepSeek 先通过 Model Gateway 接入已有 API 或单独推理节点，不能让 Web/API 直接调用供应商。

## Docker Compose 服务合同

建议服务名和边界如下：

| 服务 | 必需环境变量 | 健康检查 | 可写数据 |
| --- | --- | --- | --- |
| `web-api` | `PUBLIC_APP_URL`, `DATABASE_URL`, `REDIS_URL`, `SESSION_SECRET` | `/api/health` | 临时缓存 |
| `dispatcher` | `DATABASE_URL`, `REDIS_URL`, `LEASE_TTL_SECONDS` | `dispatcher_ready` | 无持久文件 |
| `observation-worker` | `DATABASE_URL`, `REDIS_URL`, `OBJECT_STORAGE_*`, `MODEL_GATEWAY_URL` | Worker 心跳 | `/var/lib/selection/work` |
| `hermes-runner` | `MODEL_GATEWAY_URL`, `HERMES_BIN`, `WORKSPACE_ROOT` | 受控 runner ping | 任务工作区 |
| `model-gateway` | `DEEPSEEK_BASE_URL`, `DEEPSEEK_MODEL`, `MODEL_TIMEOUT_MS` | `/internal/health` | 脱敏审计日志 |
| `postgres` | `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` | `pg_isready` | 数据卷 |
| `redis` | `REDIS_PASSWORD`（若启用） | `redis-cli ping` | 非事实缓存 |
| `object-store` | `S3_*` 或 MinIO 配置 | Bucket probe | 媒体与产物卷 |

推荐使用 Compose profiles `control`、`observation` 和 `inference`，让没有 GPU 的环境可以关闭 `inference` 并把 DeepSeek 路由到已批准的外部端点。Compose 文件应只包含变量名和占位值，真实值由部署平台 Secret 注入。

## 端口与网络

- 公网只开放 TCP 443。SSH 使用密钥、非默认端口和来源 IP allowlist。
- Postgres、Redis、MinIO、Model Gateway、Hermes 和 Worker 只加入私有 Compose 网络。
- Caddy 到 Web/API 使用内部服务名和健康检查，不把管理端口映射到宿主机公网。
- 观察来源访问使用出站 allowlist、超时和最大响应体限制。模型网关只允许访问配置中的模型端点。
- 生产数据库不允许 Worker 直接执行任意 SQL。Worker 通过内部 API 或受限数据库角色写入任务和产物。

## 关键配置基线

以下变量应写入 Secret 管理器或部署平台环境：

```dotenv
APP_ENV=production
PUBLIC_APP_URL=https://select.1add2.com
DATABASE_URL=postgres://<user>:<password>@postgres:5432/<db>
REDIS_URL=redis://:<password>@redis:6379/0
OBJECT_STORAGE_ENDPOINT=https://<private-endpoint>
OBJECT_STORAGE_BUCKET=select-workbench-prod
MODEL_GATEWAY_URL=http://model-gateway:8080
DEEPSEEK_BASE_URL=https://<approved-endpoint>
DEEPSEEK_MODEL=<approved-model-id>
DEEPSEEK_API_KEY=<secret>
HERMES_BIN=hermes
LEASE_TTL_SECONDS=900
HEARTBEAT_INTERVAL_SECONDS=60
MODEL_TIMEOUT_MS=120000
OBSERVATION_MAX_ATTEMPTS=2
OBSERVATION_RETENTION_DAYS=<approved-retention>
FEISHU_SELECTION_WEBHOOK_URL=<secret>
OIDC_ISSUER=<approved-issuer>
OIDC_CLIENT_ID=<public-client-id>
OIDC_CLIENT_SECRET=<secret>
SESSION_SECRET=<secret>
```

`DEEPSEEK_*` 只由 Model Gateway读取。Hermes 只拿到短期任务令牌和工作区路径。任务令牌不允许访问生产数据库、商店后台、Feishu 或服务器管理接口。

## 数据、备份与保留

- Postgres 保存任务、项目状态、观察事件、模型运行摘要、审计和对象引用，是唯一事实源。
- Redis 保存待投递消息、短期租约和限流计数。Redis 丢失后从 Postgres 重建 `queued` 和过期租约。
- 对象存储保存关键帧、转写、设备日志和报告。原始媒体默认短期保留，是否延长由授权和保留等级决定。
- Postgres 每日全量备份，开启 WAL/增量并至少保留 14 天。每周执行一次恢复演练，记录恢复时间和校验结果。
- 对象存储启用版本化和 SHA-256 校验，备份至少跨一个独立存储位置。
- 日志保留期限与项目数据策略分开，日志不含 Token、Cookie、完整查询参数和未脱敏用户内容。

## 资源与并发限制

默认起点如下，完成一轮 staging 压测后再调整：

- Web/API 每个容器 1–2 个进程，避免把长任务放在请求线程。
- Dispatcher 只负责短事务，单实例先运行，确认锁和租约后再水平扩展。
- Observation Worker 每个实例限制 1–2 个采集任务，模型标注与采集分开计数。
- Hermes 同时运行数由项目级预算和 Worker 容量共同限制，超过预算进入 `blocked`。
- Model Gateway 为每个项目、用户和模型设置速率限制、超时和每日预算。
- 队列积压、租约过期、模型错误率、对象存储失败和磁盘水位都需要告警。阈值先使用 staging 基线，再写入生产配置。

## 发布顺序

1. 建立 staging 的独立数据库、对象前缀、模型 Token 和域名。
2. 执行数据库迁移，读回表、索引、状态计数和审计事件结构。
3. 运行模型网关 dry-run，只验证路由、Schema、脱敏和超时，不写生产产物。
4. 使用已授权样本运行游戏观察 Harness，核对来源清单、关键帧、时间线、模型运行和人工复核。
5. 以单个 Worker、单个项目和小并发做 canary，确认租约回收、重试、幂等和告警。
6. 扩大到 MVP 并发，确认备份和恢复演练通过，再开放完整队列。
7. 每次发布记录 Git 提交、镜像摘要、迁移版本、配置版本、健康检查和回滚点。

## 回滚与停机规则

- 模型供应商异常、成本超预算、来源访问异常或观察结果 Schema 连续失败时，暂停新观察任务，保留已有租约和审计。
- Web/API 可以回滚镜像，队列和 Postgres 保持不变。迁移优先使用前向修复，禁止未验证的生产 down migration。
- 观察 Worker 可以单独停用，历史报告和候选页面仍可读。待任务回到 `queued` 或 `blocked` 后再恢复。
- Feishu 或其他外部发布失败时保留报告和卡片草稿，不自动重复发送。修复后使用同一幂等键并保存新回执。
- 发现密钥泄露时立即撤销并轮换，检查访问日志，再恢复服务。不要把密钥写入事故报告或任务产物。

## 生产验收

- Caddy HTTPS、OIDC 登录、`/api/health` 和数据库连接通过。
- 任务能完成 `queued → claimed → processing → completed`，异常可进入 `blocked` 或 `failed`，审计事件完整。
- 两个 Worker 并发领取同一观察任务时只有一个租约成功，过期租约可回收。
- Hermes 和 DeepSeek 只能通过 Model Gateway 调用，网关日志不含秘密，返回 Schema 可校验。
- 观察报告含具体来源、时间线证据、模型运行记录和人工复核结果，不能把观察完成写成项目发布完成。
- 备份恢复、磁盘告警、队列告警、模型限流和回滚演练均留有可读证据。

## 未决输入

- 是否自托管 DeepSeek，以及具体型号、显存和许可证需要项目负责人确认。
- Hermes 的实际运行时、工具合同和是否部署在独立节点需要技术负责人确认。
- 游戏观察允许的来源、设备、媒体保留时间和区域限制需要业务与法务边界确认。
- 正式服务器供应商、域名 DNS、OIDC、Feishu Webhook 和监控接入属于外部配置，本文件不宣称已完成。
