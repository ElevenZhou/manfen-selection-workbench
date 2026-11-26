# 游戏观察 Harness 与 AI Worker 架构

## 目标与边界

游戏观察 Harness 把候选、已核验的视频证据和授权的可运行版本转换成带时间线的观察记录，供选品复核、玩法拆解、原型设计和试玩验收使用。它属于证据生产链路，不等同于自动复刻、自动上架或自动替用户操作商店。

首个可交付版本覆盖以下闭环：

```text
候选与 YouTube 回执
  → 观察任务
  → 来源核验与采集
  → 帧/音频/交互事件抽取
  → Hermes 编排或 DeepSeek 推理
  → 结构化观察报告
  → 人工复核
  → 项目状态与制作档案回写
```

以下行为属于明确的非目标：

- 未经授权下载、分发或长期保存第三方完整视频、APK、账号数据或个人信息。
- 让模型直接点击生产商店、发送 Feishu 消息或修改生产数据库。
- 把观察结论当成事实完成度。`observation_complete` 只能表示证据链完成，不能表示玩法已经可玩或产品已经可发布。

## 角色分工

| 组件 | 职责 | 不应承担的职责 |
| --- | --- | --- |
| Web/API | 创建观察任务、查看进度、提交人工复核 | 运行模型、读取宿主机密钥、拉起 Shell |
| Dispatcher | 根据能力、容量、优先级和租约派发任务 | 解释视频内容或直接改报告正文 |
| Observation Worker | 核验来源、采集授权素材、抽帧、提取事件和写入产物 | 自行决定发布、绕过人工复核 |
| Hermes Harness | 拆解观察计划、安排工具调用和重试、合并阶段产物 | 直接连接 Postgres、Redis 或生产 Webhook |
| DeepSeek Adapter | 对已脱敏的帧描述、OCR、音频转写和事件做结构化推理 | 直接联网找证据、执行任意命令 |
| Model Gateway | 模型路由、配额、超时、脱敏、审计和回退 | 暴露供应商 Token 或接受未经授权的任意 Prompt |
| Reviewer | 确认时间点、纠正误判、标记证据缺口 | 无证据地补写精确数据 |

## 观察链路

### 1. 任务入队

观察任务引用 `candidate_id`、`project_id`、一个具体的 `source_artifact_id` 或已记录的视频 URL，以及当前规则版本。任务创建时生成不可变的 `observation_run_id` 和幂等键。API 返回 `queued`，不能把入队或领取展示成完成。

任务至少包含以下字段：

```json
{
  "observation_run_id": "obs_01J...",
  "candidate_id": "candidate_...",
  "project_id": "project_...",
  "source_artifact_id": "artifact_...",
  "source_url": "https://www.youtube.com/watch?v=...",
  "source_relation": "gameplay|official_demo|review",
  "mode": "video_first|device_replay|hybrid",
  "requested_outputs": ["loop", "controls", "economy", "friction", "visual_language"],
  "idempotency_key": "candidate_:source_sha256:rules-v1"
}
```

`source_url` 必须来自已有视频证据，不能由模型凭记忆拼接。`device_replay` 和 `hybrid` 只有在测试设备、模拟器或应用包已授权并登记时才可入队。

### 2. 来源核验与采集

Worker 先建立 `source_manifest`，记录 URL、最终 URL、标题、频道、发布时间、抓取时间、授权/访问范围、内容哈希和工具版本。来源不可访问时进入 `blocked`，并保留错误码和下一步补证动作。

默认采用最小留存策略：保存元数据、关键帧、帧哈希、事件时间点和必要的低分辨率预览。是否保存完整媒体由保留策略和授权字段共同决定。所有媒体都写入对象存储，数据库只保存校验和、对象键、时间范围和访问策略。

### 3. 帧、音频和交互事件抽取

采集器按场景变化、固定采样间隔和人工指定时间点生成关键帧。抽取器输出带时间戳的中间事件，例如启动、主菜单、核心循环、失败、奖励、广告/付费提示、暂停、返回和异常状态。

每个事件必须有 `evidence_ref`，至少指向一个帧、转写片段或设备日志。没有证据的内容只能放在 `hypotheses`，不能放进事实字段。

### 4. Hermes 编排与 DeepSeek 推理

Hermes 作为长任务编排层时，负责把观察合同拆为可重试步骤：来源确认、采集、抽取、初标、总结和人工复核。每一步都有输入产物哈希、输出产物哈希、预算、超时和重试次数。Hermes 只能通过受控工具合同调用 Worker 或 Model Gateway。

DeepSeek 作为推理后端时，默认接收结构化文本、OCR、音频转写和关键帧引用。若选定的 DeepSeek 部署支持视觉输入，Gateway 可以传入受控的图像对象引用。若不支持视觉输入，必须先由帧描述器生成文本，报告中记录该降级路径和损失的视觉信息。

两者可以替换，但不能同时对同一阶段无记录地重复推理。每次模型调用保存 `model_run_id`、模型标识、模板版本、输入哈希、输出校验、Token/时延统计、失败原因和人工覆盖记录。

### 5. 模型网关

Model Gateway 是唯一允许访问模型供应商或本地推理服务的组件。建议提供有限的内部路由：

```text
POST /internal/model/observe-plan
POST /internal/model/frame-annotate
POST /internal/model/event-summarize
POST /internal/model/review-diff
```

Gateway 的固定职责如下：

- 按任务类型、成本上限和可用性选择 Hermes、DeepSeek 或已批准的回退模型。
- 对输入执行 URL、Token、Cookie、个人信息和生产密钥脱敏。
- 为每个请求附加 `request_id`、`observation_run_id`、规则版本和预算。
- 统一超时、重试、熔断、速率限制和响应 Schema 校验。
- 只把结构化 JSON 和产物引用返回给 Worker，拒绝任意 Shell、SQL、网络代理和发布动作。

Gateway 日志保存元数据和哈希，不保存完整密钥、未经处理的私有媒体或完整 Prompt。供应商调用失败时，任务进入 `blocked` 或可重试的 `failed`，不能静默改用另一模型并掩盖差异。

## Worker 状态机

观察任务使用独立状态机，与选品任务和制作项目状态分开：

```text
queued → claimed → capturing → extracting → annotating → review → completed
  ├──────────────────────────────────────────────────────────────→ blocked
  ├──────────────────────────────────────────────────────────────→ failed → queued
  └──────────────────────────────────────────────────────────────→ cancelled
capturing/extracting/annotating → stale → queued | blocked
```

状态推进要求：

- 每次状态变化写入审计事件，包含操作者、Worker、租约、原因、规则版本和产物引用。
- `completed` 必须有来源清单、至少一个可复核证据、结构化观察结果、模型运行记录和人工复核结果。仅有模型文本不能完成。
- 同一个 `observation_run_id` 重试时沿用幂等键，旧产物保留，新的尝试通过 `attempt` 关联。
- 租约默认 15 分钟，心跳按 60 秒发送。超时回收器先标记 `stale`，再根据重试次数回队或 `blocked`。

## 持久化边界

Postgres 是事实源，Redis 只负责短期投递、租约和限流，对象存储负责媒体和大产物。建议新增以下实体：

| 实体 | 关键字段 | 作用 |
| --- | --- | --- |
| `gameplay_projects` | `id`, `candidate_id`, `status`, `rules_version` | 记录从观察到制作/试玩的项目主状态 |
| `observation_runs` | `id`, `project_id`, `source_artifact_id`, `status`, `attempt` | 一次可审计的观察尝试 |
| `observation_events` | `run_id`, `at_ms`, `kind`, `confidence`, `evidence_ref` | 时间线事件与证据定位 |
| `observation_artifacts` | `run_id`, `object_key`, `sha256`, `retention_class` | 关键帧、转写、日志和报告 |
| `model_runs` | `run_id`, `gateway_request_id`, `provider`, `model`, `input_hash`, `output_hash` | 模型调用审计和成本复盘 |
| `review_decisions` | `run_id`, `reviewer_id`, `decision`, `overrides` | 人工确认、修改和阻塞原因 |

项目主状态建议为：

```text
candidate → observation_pending → observing → observation_reviewed
→ design_input_ready → prototype → playtest → release_review
→ approved | blocked | archived
```

`observation_reviewed` 只表示观察资料经人工确认。`prototype`、`playtest` 和 `approved` 必须由各自的构建、真机或发布门禁证明，不能由观察 Worker 代替。

## 队列与并发

队列按 `observation`、`review`、`recovery` 分组，并为每项任务设置优先级、项目级并发上限、Worker 能力标签和全局预算。Dispatcher 使用数据库条件更新或队列原子领取，避免两个 Worker 同时获得同一租约。

Redis 丢失后可依据 Postgres 中 `queued`、`claimed` 和过期租约重建队列。重复投递属于正常 at-least-once 情况，所有产物写入和项目回写必须使用 `(observation_run_id, attempt, artifact_kind)` 幂等键。

## 失败、安全和人工门禁

- 来源被删除、地域不可访问或授权不清晰时标记 `blocked`，保留检索范围和限制。
- 模型输出 Schema 不通过时重试一次，仍失败则进入人工复核，不直接写入项目结论。
- Worker 运行在无生产密钥的沙箱中，只能访问任务工作区、允许的来源和 Model Gateway。
- 原始媒体、设备日志和用户内容分级保存，日志使用哈希或内部 ID，不打印 Cookie、Token、设备标识和完整 URL 查询参数。
- 任意外部发布、商店操作、Feishu 发送和真实设备写操作都必须由独立的人类授权步骤完成。

## 观察链路验收

1. 从一个已记录的 YouTube 视频创建任务，能读回 `queued → completed` 全部事件和产物哈希。
2. 两个 Worker 同时领取同一任务只有一个租约成功，另一个能安全重试。
3. 让心跳停止，回收器能将任务置为 `stale` 并按策略回队或阻塞。
4. 删除或拒绝访问来源时，任务停在 `blocked`，页面显示限制和下一步补证动作。
5. 修改模型供应商后，报告仍能按 `model_run_id` 区分并重现输入、输出和模板版本。
6. 人工复核修改事件时，原始模型输出仍可读取，项目状态只接受复核后的版本。
7. 观察完成不能直接把项目置为 `prototype` 或 `approved`，需要后续门禁证据。

## 当前假设与待确认项

- Hermes 的具体运行时、工具合同和部署方式尚未锁定，本设计按受控编排器处理。
- DeepSeek 的具体型号和是否支持视觉输入尚未锁定。没有视觉能力时必须走帧描述降级路径。
- 视频和设备采集的授权范围、保存时长与区域合规要求需要在 Pilot 前由项目负责人确认。
- 真实并发、帧采样成本和模型预算需要用一批已授权样本压测后再调整。
