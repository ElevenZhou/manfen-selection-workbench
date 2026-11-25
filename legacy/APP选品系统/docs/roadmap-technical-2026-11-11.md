# 选品系统完整 Web 化与部署技术路线

版本：2026-11-11  
依据：当前 `site/`、`docs/05`、`docs/11`、`docs/14`、`schemas/` 与现有脚本盘点。

## 现状基线

当前网站已经是 Next 16 + React 19 + Vinext/Vite + Cloudflare D1/Drizzle 的可运行闭环，入口包含 `/`、`/reports`、`/reports/[id]`、`/candidates`、`/packages`、`/schedule`、`/research`、`/ingest`、`/selector`，并提供 `GET/POST /api/reports`、`POST /api/reports/:id/feishu`、`POST /api/selection-requests`。报告和候选已有 D1 持久化、幂等入库、Schema 校验、Feishu 推送和公开报告展示。`lib/types.ts` 已有 `mobile_app`、`mobile_game`、`web_app`、`desktop_app`、`cross_platform`，因此扩展游戏与跨平台应优先扩展统一实体和路由，不另起一套站点。

现有缺口是：研究任务尚未形成可追踪的任务队列；信号、证据、竞品、评价主题和开发反馈仍主要以报告 JSON/文本承载；页面以公开阅读为主，审批、复评、任务执行、Agent 回执和部署状态缺少统一操作面；鉴权/角色、审计日志、后台异步任务和失败重试需要补齐。

## 目标架构

```text
浏览器
  ├─ 公开阅读：报告、候选、证据、资料包
  └─ 操作台：创建研究、审批状态、排期、回执、复评
        ↓
Next/Vinext Web + Route Handlers
        ↓
任务编排层（D1 tasks + Queue/Workflow）
  ├─ research adapter（联网检索/API/MCP）
  ├─ evidence normalizer（统一证据契约）
  ├─ engine A/B/C scorer（路线隔离）
  ├─ package builder（工作台资料包）
  └─ publisher（网站/飞书）
        ↓
Cloudflare D1（事实与状态） + R2（大文件/附件） + KV（短期缓存）
        ↓
外部连接器：官方商店、Steam、Google Play、Apple、GitHub、新闻/趋势 API、Feishu
```

任务层必须保存输入、假设、执行器、开始/结束时间、状态、产物、错误和幂等键。Agent 或 MCP 只负责执行研究/转换动作，不能直接改路线结论；所有结果先落成 `skill-result`，通过 Schema 和证据门禁后才能晋级。

## 统一数据扩展

保留 `report`、`candidate` 作为公开阅读聚合，新增以下表（可分两次迁移）：

- `research_tasks`：`id, mode, prompt, scope_json, status, requested_by, idempotency_key, created_at, started_at, finished_at, error_json`。
- `task_events`：任务事件流，支持 Agent/MCP 回执和重放。
- `evidence_items`：来源 URL、对象类型、平台、国家、采集时间、指标、原文摘要、可信度、缺口和冲突。
- `product_entities`：统一记录 App、游戏、Web、桌面、跨端对象；`product_form` 与 `target_platforms[]` 分离。
- `migration_opportunities`：源平台、目标平台、迁移约束、轻量化策略、版权/许可状态、技术风险、验证计划。
- `trend_signals`：热点主题、来源、基线、变化、持续性和路由。
- `review_themes`：评论主题、频次、情绪、证据链接和待验证问题。
- `decisions`：候选状态变更、操作者、理由、方法版本和前后值。
- `deployments`：环境、版本、域名、部署时间、健康检查、回滚版本。

`opportunity-candidate.schema.json` 增补 `target_platforms`、`source_platform`、`migration_type`、`license_status`、`evidence_ids`；新增 `migration-opportunity.schema.json` 和 `task-event.schema.json`。迁移期间旧字段保持可读，网站 API 返回 `schemaVersion`。

## 产品形态与三条新增路线

1. **App/游戏统一选品**：在同一候选库增加 `product_form=mobile_game`、玩法标签、核心循环、留存指标、付费结构、版本频率和商店链接。游戏评分仍按 Engine A/B/C 各自排名，不能与 App 混成单一总分。
2. **跨平台迁移创新**：新增“迁移工作台”，记录 Steam/桌面/Web/主机源产品到 Android/iOS/Web 的目标平台、可保留核心循环、性能预算、输入改造、离线策略、版权许可与最小验证包。PS、Office 等仅在许可/兼容性状态明确时进入开发队列；否则停在 `WATCH/LEGAL_REVIEW`。
3. **日常生活与热点**：新增信号雷达和主题任务模板，允许自然语言、URL、文件或热点关键词触发；必须保留采集时间、来源、基线、持续性和证据缺口，热点本身不等于候选。

## API 与页面增量

优先实现以下 API：

- `POST /api/research-tasks` 创建任务；`GET /api/research-tasks/:id` 查看状态和回执；`POST /api/research-tasks/:id/cancel` 取消未开始任务。
- `GET /api/signals`、`GET /api/evidence/:id`、`GET /api/entities/:id`。
- `POST /api/candidates/:id/decision` 写入审批/退回/观察决定，强制理由与幂等键。
- `POST /api/candidates/:id/review` 发起复评；`POST /api/migrations` 建立跨平台迁移机会。
- `GET /api/operations/health` 返回 D1、Queue、外部连接器和最近一次部署的事实状态。

页面增量：`/tasks` 任务队列、`/tasks/[id]` 时间线与 Agent 回执、`/signals`、`/evidence/[id]`、`/migrations`、`/migrations/[id]`、`/operations`、`/methodology`。操作页面默认要求 ChatGPT/OIDC 身份；公开报告继续只读。

## Agent/MCP 接入边界

建立 `connector` 注册表：名称、能力、所需密钥、超时、速率限制、数据等级、是否可写。每次调用经服务端代理，密钥只在环境变量/密钥系统；前端不能直接持有 Token。MCP 工具返回必须包装为 `skill-result`，记录工具名、参数摘要、来源、耗时、重试次数和原始回执哈希。对搜索、商店、趋势等连接器采用超时、单次重试、退避和 `insufficient_data`；支付、账号权限和域名 DNS 失败应硬停并保留错误。

## 部署与域名

短期继续使用现有 ChatGPT/Codex Sites + D1，先补齐数据表、任务 API 和操作台，再迁移到自有 Cloudflare Worker/Pages（需要时）以获得 Queue、Cron、R2 和自有域名控制。上线清单：

1. 创建 staging/production 两套 D1、R2、KV 和 Queue；执行 Drizzle migration，导入脱敏报告。
2. 配置环境变量：D1 binding、Feishu webhook、外部 API keys、公开站点 origin、OIDC/ChatGPT auth；密钥只在平台 Secret。
3. `npm ci && npm run lint && npm test && npm run build`；对 `/api/health`、报告列表、详情、入库幂等和 Feishu 回执做 smoke test。
4. 绑定正式域名 `select.1add2.com`，配置 DNS、TLS、HSTS、robots 与 canonical；旧预览域名在切换期保留重定向。
5. Canary 发布到 staging，核对 D1 写入、Queue 消费、失败重试、回滚版本和公开页面；再切 production。
6. 部署后记录 `deployments`，保存版本、提交哈希、迁移编号、健康检查和回滚命令；域名、DNS、账号权限变更需要用户提供或确认凭据。

## 分阶段执行

- **Spike（1 周）**：完成统一实体/任务表、迁移 Schema、任务创建 API 和一条模拟 Agent 适配器；验收可创建任务、产生事件、幂等重放。
- **Demo（1–2 周）**：完成 `/tasks`、`/signals`、`/migrations`、游戏候选字段和证据详情；用现有报告回填并跑浏览器 smoke test。
- **MVP（2–4 周）**：接入 2–3 个真实数据连接器、Engine A/B/C 任务编排、审批与复评、R2 附件、审计日志和飞书回执。
- **Pilot（2 周）**：staging/production 双环境、Queue/定时任务、权限、监控、域名 canary、回滚演练；用 App、游戏、跨平台和热点各跑一轮。
- **Production**：按运行成本和证据质量逐步增加连接器；每次方法变更带版本号并保留旧报告可复现。

## 质量门禁

必须通过：Schema 校验、路线隔离、证据 URL 可达性、产品形态/平台字段完整、敏感信息扫描、任务幂等、失败可见、审计日志、权限测试、构建/渲染测试、部署健康检查和回滚演练。任何“已部署”“已生效”“已推送”都要有实际回执或读回证据；没有回执则状态保持 `PENDING/UNKNOWN`。

## 当前立即可做的工程任务

1. 把任务/信号/迁移 Schema 和 D1 migration 加入仓库。
2. 把 `/api/selection-requests` 改成写入 `research_tasks`，前端显示真实状态。
3. 在统一 `candidate` 详情中增加平台矩阵、迁移约束、证据列表和游戏指标空态。
4. 增加 `/operations` 健康页与部署记录，补齐 staging smoke test。
5. 先在现有站点完成数据和操作闭环，再做自有域名切换；域名和生产凭据由用户在需要外部变更时提供。

## 待办：修复选品与竞品的 1-1 对应关系

状态：待下一个开发周期处理，并随修复版本重新发布。

问题：最近一轮游戏报告中，五个不同选品在公开报告层被写成同一组竞品。虽然研究证据层曾按候选记录不同对象，但 `website-report-v2.json` 的 `references` 被通用集合覆盖，导致用户无法判断每个选品究竟对应哪个竞品。

修改方案：

- 在候选数据契约中增加必填的 `primary_competitor`（唯一主对应竞品）字段，建立候选与主竞品的明确 1-1 关系。
- 将其他可借鉴产品单独放入 `reference_objects`，并标注 `reference_type`（玩法、增长、商业化、分发等），不得与主对应竞品混称。
- 生成报告、网站入库、候选详情和飞书卡片时，统一展示“主对应竞品”和“其他参考对象”两个区块；禁止使用全局通用竞品数组填充所有候选。
- 主对应竞品缺失、重复映射或与候选核心循环不匹配时，候选不得进入 `SELECTED/READY_FOR_BENCH`，应停留在 `REVIEW/BLOCKED`。
- 为历史报告增加兼容迁移：保留原始证据，按候选重新生成主竞品映射；无法可靠确认的记录标记 `insufficient_data`，不擅自补值。

验收条件：

1. 五个候选逐项显示各自唯一主对应竞品，且不再全部复用同一组竞品。
2. 参考对象可以多个，但页面和导出数据中与主对应竞品明确分栏、分字段、分关系类型。
3. Schema 校验、报告入库、公开报告页面、候选详情和飞书卡片全部通过 smoke test。
4. 重新生成并发布修订报告后，核对公开 HTTP 200、页面内容和发布回执；没有回执不得标记为已发布。
