# Gameplay-first 产品架构复盘

复盘日期：2026-11-27（Asia/Singapore）
新决策：研究交付以“实际观察、玩法判断、复制开工提示词和受控 AI 执行器”为主线，证据用于证明观察来源和限制，不再把证据完整度/路线分数作为主要交付结果。

## 产品主线调整

旧主线是“来源 → 证据评分 → 候选排序 → 资料包”。明早应切换为：

```text
候选发现
  → 实际玩法观察
  → 玩法拆解与决策
  → 人工确认
  → 复制开工提示词
  → 选择受控 AI 执行器
  → 设计/代码产物
  → 人工验收与测试回执
```

证据字段继续保留来源、时间、URL、可访问性和限制，但它们服务于“这条玩法观察从哪里来、哪些仍未验证”。`routeScore`、`dataCompleteness`、商店排名和 YouTube 数量不能单独触发开工或完成。

## 现有实现与新决策的差距

- `ProjectWorkspace` 已能选择三套方案、编辑并复制 AI Studio 提示词、回填链接，但还没有结构化的玩法观察表、玩法决策记录、执行器选择、执行运行 ID、产物版本和人工门禁记录。
- `buildAiStudioPrompt` 已要求先研究核心玩法、生成三套图像方向和给出技术方案，但这些内容仍是提示词文本，系统无法判断观察是否完成、用户是否批准或执行器是否真的运行。
- `ProjectRecord` 的状态从 `SELECTED` 直接覆盖到 `SENT_TO_AI_STUDIO`、`BUILDING` 等制作阶段，缺少“观察完成”“玩法决策确认”“提示词批准”“执行器已领取”和“产物复核”等中间事实。
- `YoutubeEvidence` 当前保存具体视频回执并展示链接，尚未保存可定位的观察摘录，例如时间戳、操作、输入、反馈、节奏、失败恢复和与候选/竞品的关联。视频链接存在不等于玩法已观察。
- Worker 目前负责选品报告研究和入库，不负责项目级 AI 执行器运行。将“保存提示词并标记已交接 AI Studio”视为执行完成会造成状态误判。

## 建议的状态机

将任务、候选研究、项目执行分为三层，避免一个状态字段承载所有事实。

### 1. 选品任务层

```text
queued → claimed → researching → gameplay_review → decision_pending
                                      ├→ blocked
                                      └→ cancelled
```

- `researching` 只表示正在收集候选和观察材料。
- `gameplay_review` 表示已有可复核的玩法观察草稿，等待人工核对。
- `decision_pending` 表示需要选择“复制哪一段核心循环、解决哪个痛点、做哪种微创新”。
- 没有真实可观察材料时可以 `blocked` 或 `partial`，不能用分数替代。

### 2. 候选/玩法决策层

```text
discovered → observed → observation_partial → decision_draft
                                      ↓              ↓
                                 blocked        decision_approved
```

每个候选至少形成一份 `GameplayObservation`，建议字段如下：

```json
{
  "candidate_id": "...",
  "observation_status": "observed|partial|blocked",
  "platform": "ios|android|web|video_only",
  "session_source": "installed_game|authorized_build|official_video|review_video",
  "observed_at": "2026-11-27T00:00:00Z",
  "observation_duration_seconds": 420,
  "core_loop": ["进入关卡", "拖拽匹配", "反馈连击", "结算奖励"],
  "player_input": ["触控拖拽"],
  "moment_to_value_seconds": 18,
  "feedback": ["音效", "粒子", "连击数字", "失败提示"],
  "difficulty_and_failure": "...",
  "content_or_level_structure": "...",
  "monetization_or_progression": "observed|not_observed|unknown",
  "pain_points": ["..."],
  "source_refs": ["video-evidence-id-or-session-id"],
  "limitations": ["仅通过公开视频观察，未安装体验"]
}
```

玩法决策另存为 `GameplayDecision`，至少包含核心循环、保留点、删除点、微创新、目标平台、首个可玩切片、停止条件、决策人和时间。证据完整度只能作为限制提示，不应计算成唯一总分。

### 3. 项目/执行层

```text
decision_approved
  → prompt_draft
  → human_prompt_gate
  → executor_queued
  → executor_claimed
  → executing
  → artifact_review
  → human_build_gate
  → qa_review
  → completed

任意执行阶段 → blocked | failed | cancelled
executing --租约过期--> executor_queued
artifact_review --图像/代码缺失--> DESIGN_IMAGE_BLOCKED 或 blocked
```

`SENT_TO_AI_STUDIO` 只代表提示词已批准并提交给执行器，不能代表执行成功。执行结果必须有 executor、run ID、版本、开始/结束时间、产物路径/哈希、日志摘要、未验证项和下一步。

## 人工门禁

### Gate 0：范围和授权

- 确认平台、目标用户、观察方式和可用授权。
- 禁止绕过付费墙、访问控制、加密或未授权 APK。
- 无法取得授权时进入 `blocked`，保留研究假设和可替代的公开视频观察路径。

### Gate 1：实际玩法观察

- 至少完成一次安装体验、授权构建体验或可定位的官方/评测视频观察。
- 记录输入、反馈、节奏、失败恢复、内容结构和第一段有价值体验。
- 每条观察必须能回到具体视频 URL、时间戳、截图/运行记录或明确的 `insufficient_data`。
- 只有商店介绍、榜单、截图或模型猜测时，最多为 `observation_partial`。

### Gate 2：玩法决策

人工确认四件事：

1. 复制的核心循环是什么。
2. 哪些机制、内容和表达明确不复制。
3. 首版只做哪个可玩的切片。
4. 微创新和停止条件是什么。

没有决策人、时间和理由时不能进入 `decision_approved`。

### Gate 3：提示词批准与执行器选择

- 提示词必须带入观察事实、来源/时间、限制、玩法决策、原创边界、验收标准和首版切片。
- 操作员选择 `codex`、`opencode`、`hermes` 或手动执行，并确认权限、预算、超时、网络策略和工作区。
- 复制提示词不等于调用执行器。调用前必须产生人工批准事件和幂等执行键。

### Gate 4：产物复核

- 设计方向必须有真实图片产物，缺失时标记 `DESIGN_IMAGE_BLOCKED`。
- 代码/构建产物必须附 commit、构建命令、版本、截图/录屏和已知问题。
- 复核者确认核心循环可操作，首个有价值体验可到达，微创新可辨识，且没有直接复制受保护资产。

### Gate 5：测试与交付

- 至少通过正常路径、失败恢复、重启/断点、无网络或外部服务失败路径。
- 保存测试设备/浏览器、时间、结果、失败项和回滚动作。
- 未通过时回到 `qa_review` 或 `blocked`，不能手工把状态改成 `completed`。

## 关键失败路径

| 失败 | 状态 | 用户看到的动作 | 不允许的行为 |
| --- | --- | --- | --- |
| 无法安装或无授权 | `blocked` | 显示授权缺口，改走公开视频或人工补证 | 假装已实际体验 |
| 视频能开但无法定位玩法 | `observation_partial` | 显示时间范围和缺失字段，要求补充观察 | 用视频标题推断完整玩法 |
| 观察结果冲突 | `decision_pending` | 展示冲突来源，要求人工选择或放弃候选 | 自动平均或按分数裁决 |
| 核心循环说不清 | `blocked` | 返回“无法形成首版切片”并保留原因 | 自动生成泛化提示词 |
| 提示词缺观察/原创边界 | `prompt_draft` | 阻止提交执行器，指出缺失字段 | 直接标记已交接 |
| 执行器不可用/超时 | `executor_queued` 或 `failed` | 同一幂等键重试，展示日志和下一步 | 无限重试或换凭据 |
| 产物缺图片/代码/构建证据 | `DESIGN_IMAGE_BLOCKED` 或 `artifact_review` | 返回补产物清单 | 只凭文字说明通过 |
| 发现复制风险 | `blocked` | 转原创边界复核，保留事实和来源 | 继续生成近似品牌/角色/关卡 |
| 外部发布或消息回执不确定 | `blocked` | 保留本地结果，等待人工确认 | 把 HTTP 成功当业务成功 |

## 明早可用验收项

### 最小可演示流程

1. 从 `/selector` 发起一个游戏玩法任务，任务 ID、幂等键和当前状态可见。
2. Worker 领取任务并生成至少一个候选，候选页面显示玩法观察摘要、来源视频/运行记录和限制。
3. 在候选或制作档案中填写并保存核心循环、目标平台、痛点、微创新和首版切片。
4. 人工点击“批准玩法决策”，系统才生成可复制的开工提示词。
5. 提示词显示观察事实、来源链接、原创边界、首版验收标准和 `insufficient_data` 限制。
6. 操作员选择一个受控执行器，生成执行记录和 run ID。未配置执行器时明确显示 `executor_unavailable`，不能显示“已执行”。
7. 执行器失败时任务停在 `failed/blocked`，页面显示重试/补资料动作。相同执行键重试不重复创建项目。
8. 有真实图片和构建/测试回执后，人工确认 `qa_review → completed`。没有图像产物时显示 `DESIGN_IMAGE_BLOCKED`。

### 工程验收

- `npm test`、`npm run lint`、`npm run build` 通过。
- 至少覆盖观察字段缺失、未授权观察、提示词缺来源、执行器超时、幂等重试、图像产物缺失和 QA 阻塞测试。
- 页面可从候选 → 玩法决策 → 提示词 → 执行回执 → 测试记录往返，不要求手工复制 ID。
- 报告/Feishu 仍可作为研究回执，但不把 `routeScore`、`dataCompleteness` 或 Feishu HTTP 200 当作玩法决策或执行成功。

## 明早范围取舍

明早可先采用“人工记录观察 + 受控手动执行器入口”的 MVP。需要真实 AI 执行器接入时，先实现一个带租约、幂等键、超时和产物回执的 adapter。Codex/OpenCode/Hermes 多适配器、自动分派容量、常驻 Worker、OIDC、生产部署和真实商店安装留到后续阶段。任何缺少授权、执行器或构建产物的路径都要可见地停在 `blocked/partial`。

## 结论

项目的第一性产物应从“高分候选”改为“可复核的玩法观察 + 明确的复制决策 + 可执行的首版切片”。系统完成的定义应绑定人工门禁和 AI 执行回执。证据保留为观察的来源与限制，不能越权替代实际玩法判断、提示词批准、执行器运行或测试通过。
