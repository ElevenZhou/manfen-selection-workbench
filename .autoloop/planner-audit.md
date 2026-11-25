# 明早可用审计：满分选品工作台

审计时间：2026-11-26（Asia/Singapore）
审计范围：`apps/selection-web`、项目契约/路线图/任务台账、当前 Worker 入口
结论口径：以“本地可启动、可以发起任务、可以稳定完成一次报告入库、结果可查看”为明早可用的最小闭环。正式生产部署、OIDC、Postgres/Redis、真实 Feishu 生产凭据仍属于外部发布门禁。

## 当前事实

### 已有能力

- Next 16 + React 19 + Vinext/Vite + Cloudflare D1 的网站基线可构建。
- 已有页面：首页、报告、报告详情、候选总表、资料包、制作档案、开发排期、调查报告、报告导入、选品启动器。
- `lib/reports.ts` 已具备 D1 表自举、内置报告种子、报告/候选校验、重复报告 ID 拒绝、候选筛选、制作档案读写。
- 已有 `POST/GET /api/selection-requests`、`POST /claim`、`POST /update`，Worker 可领取并回写任务。
- 报告导入及 Feishu 服务端推送已有幂等键和收据结构，公开页面未直接暴露 Webhook。
- 现有 `npm test` 覆盖页面结构、报告边界、引用链接、APK 来源、Feishu 推送、启动任务等回归检查。

### 与暂定设计的差距

1. **任务系统仍是轻量队列，不是设计中的任务闭环。** 当前只有 `selection_requests`，状态仅允许 `queued/processing/completed/failed`。缺少 `claimed/review/blocked/cancelled`、负责人、租约、心跳、重试、回收、任务审计和幂等键。
2. **认领/分派容量未实现。** `/claim` 只按创建时间取第一条并直接改成 `processing`，没有人员配置、技能/市场匹配、基础容量、额外认领 2 个额度、全局硬上限或并发锁。
3. **YouTube 视频证据未实现。** 类型、数据库、报告校验和候选详情都没有 `youtube_video_evidence` 字段或回执展示。当前报告即使没有视频证据也可以导入并显示为完成/可进入工作台，违反产品契约门禁。
4. **Worker 完成门禁不完整。** Worker 会生成并 POST 报告，然后直接把任务更新为 `completed`。没有对报告版本读回、每候选 YouTube 回执、审计事件、Feishu disabled/成功收据以及失败重试做统一校验。
5. **身份与权限未接入。** 当前接口没有用户身份/角色授权。产品契约要求普通成员、维护人员和管理员区分能力，数据模型要求所有写 API 有身份、权限、幂等键、速率限制和审计。
6. **生产运行条件未闭合。** `scripts/selection-worker.mjs` 是一次性手动脚本，未验证常驻进程/调度器。正式域名、DNS、OIDC、Feishu 生产 Webhook、备份、监控、回滚仍未取得外部回执。

## 明早可用的最小范围

### 必须完成（P0）

1. 任务 API 统一状态机：`queued → processing → review → completed`，失败进入 `blocked` 或 `failed`，每次变更写入最小审计事件。保留当前页面兼容字段。
2. 任务创建幂等：接收 `Idempotency-Key`，相同键返回原任务，不重复插入。
3. Worker 领取安全：原子 `UPDATE ... WHERE status='queued'`，返回唯一任务；增加 `lease_until/attempts/updated_at`，超时任务可回到 `queued`，重复回收不重复派发。
4. 完成门禁：报告保存成功并读回、候选结构校验、YouTube 回执完整、Feishu 已发送或明确 `disabled` 后才能 `completed`。否则保留 `review/blocked` 并显示原因。
5. YouTube 最小实现：扩展候选模型为 `youtubeEvidence`，允许 `found` 和 `insufficient_data`。保存查询词、检索时间、范围、限制和具体视频 URL，候选详情/报告详情至少有“视频证据”区块。历史候选可用 `insufficient_data` 明确回填，不能假称已找到。
6. 选品启动器显示真实阶段：任务列表显示 `queued/processing/review/completed/blocked` 及错误/补证原因。Worker 手动执行命令在 README 中可复现。
7. 回归验证：`npm test`、`npm run lint`、`npm run build` 均通过，至少新增任务幂等、原子领取、完成门禁、YouTube `insufficient_data` 的测试。

### 可暂缓（不阻塞明早本地试用）

- OIDC 与完整三角色权限，先保留本地开发模式的明确假设并在 UI 标出。
- Postgres/Redis、Docker Compose、常驻 Worker、备份/监控和 staging canary。
- 自动人员分派、主动认领额外容量、管理员重派、成本看板和公平性报告。
- 真实 Feishu 生产 Webhook。若未配置，完成回执必须记录 `disabled`，不能把未发送标成成功。

## 明早验收清单

### 正常路径

- 打开 `/selector`，提交 1 个合法任务，得到稳定任务 ID。
- 同一个 `Idempotency-Key` 重复提交只生成一条任务。
- 运行一次 Worker，任务从 `queued` 进入 `processing`，报告写入后进入 `review` 或 `completed`。
- `/api/selection-requests?id=...` 返回状态、报告 ID、更新时间和失败/补证原因。
- 报告详情、候选详情、制作档案可打开，候选能看到视频证据或 `insufficient_data` 记录。

### 失败和并发路径

- 同一任务并发两次领取只有一次成功，另一请求得到空任务或容量冲突。
- 报告 JSON 缺字段、候选引用不合法、视频回执缺范围时不能进入 `completed`。
- Worker 中途失败会记录错误并可重试，不会留下“已完成但无报告”的状态。
- 任务租约过期可回收一次，重复回收不创建重复任务/重复审计。
- Feishu 未配置时不阻塞本地试用，但回执必须是 `disabled`，页面不能显示“已推送”。

### 工程检查

- `cd apps/selection-web && npm test`
- `cd apps/selection-web && npm run lint`
- `cd apps/selection-web && npm run build`
- `git diff --check`
- 本地开发服务器启动后，用浏览器验证 `/`、`/selector`、`/reports`、`/candidates`、`/projects`、`/api/selection-requests`。

## 风险与负责人建议

| 风险 | 影响 | 明早处理 | 负责人 |
| --- | --- | --- | --- |
| YouTube 证据缺口 | 完成状态和制作入口不可信 | 先补 `found/insufficient_data` 结构与门禁 | 技术经理 + 测试经理 |
| 队列并发竞争 | 重复执行、容量失控 | 原子领取、幂等键、租约 | 技术经理 |
| 无身份权限 | 生产不能安全开放写操作 | 明确本地试用假设，生产前接 OIDC | 产品/运维 |
| Worker 非常驻 | 任务可能长期 queued | 明早提供可复现手动命令，生产前接调度器 | 运维 |
| 外部服务凭据缺失 | Feishu/正式域名无法宣称上线 | 保持 `disabled`/未发布状态，保存检查结果 | 项目经理 |

## 建议执行顺序

1. 技术先补任务状态、幂等、原子领取、租约和完成门禁。
2. 前端补任务阶段提示、视频证据展示和候选详情入口。
3. Worker 接入同一完成门禁，失败时写回 `blocked`/错误。
4. 测试执行构建、lint、单元/回归和浏览器冒烟，修复阻塞缺陷。
5. 项目经理复核验收证据，记录本地可用边界与生产遗留项。

## 阶段判断

当前阶段：`MVP 设计冻结前`，入口证据为已有网站基线和文档契约。
明早目标阶段：`Demo/MVP 本地闭环`，允许手动 Worker 和本地开发模式，但必须完成任务创建、报告入库、视频回执、状态查询和失败可见性。
正式 `Production` 仍未通过，因为缺少身份、持久 Worker、部署、监控、备份、回滚和外部连接回执。
