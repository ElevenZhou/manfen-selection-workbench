# Loop 与独立技能架构

> 版本：v1.1  
> 阶段：Architecture / Research-only  
> 目标：由 Auto Loop 组织完整选品系统，同时让每个核心能力都能脱离本项目独立调用。

## 1. 总原则

系统采用“薄总控、厚技能、稳定契约、独立执行面”：

- Loop 只负责理解目标、拆任务、路由、检查依赖、组织重试、汇总结果和执行 QA；
- 每个 Skill 自己负责领域方法、数据要求、评分、门槛和结果质量；
- 三条选品路线各自建池、评分、排名和最终评选，不跨路线比较；
- Skill 不依赖 Loop 的私有上下文，既可接标准任务，也可接自然语言、URL、文件、API 返回或人工导出；
- 编排调用与独立调用最终进入同一内部模型，执行同一门槛，输出同一结果契约；
- 开发排期是选品之后的独立流程，不反向修改路线结果。

## 2. 六大架构块

```text
① Input Gateway
   自然语言 / 标准JSON / URL / CSV / 报告 / API数据 / 历史run
                         ↓
② Auto Loop Control Plane
   Sense → Frame → Route → Run → Verify → Improve → Deliver
                         ↓
③ Core Skills
   数据证据、信号雷达、路线A、路线B、路线C、资料包、网站、飞书、排期、校准
                         ↓
④ Shared Contracts & Evidence Ledger
   Task Envelope、Result Envelope、Signal、Evidence、Candidate、Package
                         ↓
⑤ Output Surfaces
   周报告 / 即时报告 / 15个资料包 / 网站数据 / 飞书卡片与回执 / 开发排期
                         ↓
⑥ Outcome Feedback
   发布、下载、激活、留存、收入、停止原因 → 各路线分别校准
```

### 2.1 Input Gateway：输入适配层

负责把不同入口转换成统一任务，不做业务判断。

支持：

- 用户自然语言；
- Loop 的标准 `Skill Task Envelope`；
- 项目或参考对象名称、官方商店链接、产品官网、证据链接和参考对象列表；
- CSV、JSON、Markdown、表格和供应商导出；
- 搜索趋势、GitHub、社交讨论、流量和商店数据；
- 已有 `run_id`、候选、证据包或工作台资料包；
- 其他 Agent、自动化或后台服务提交的任务。

输入不完整时，Skill 可以补默认值并记录假设；缺少凭证、付费权限或会造成外部变更时才暂停。

### 2.2 Auto Loop Control Plane：总控层

Loop 负责：

1. 读取目标和项目规则；
2. 建立本次运行合同；
3. 判断调用一个 Skill、多个 Skill，还是完整周运行；
4. 生成带 `task_id`、`parent_run_id` 和输出要求的任务信封；
5. 检查前置结果和数据新鲜度；
6. 调用 Skills，处理可重试失败和降级；
7. 验证各 Skill 的结果契约；
8. 组织批评、改进和最终汇总；
9. 把结果交给报告、网站或开发排期。

Loop 不负责：

- 替路线重新打分；
- 用统一分数混排三条路线；
- 为了五个开发台减少路线入选数量；
- 在证据不足时替 Skill 补造结论；
- 绕过 Skill 的暂停条件执行购买、登录、发布或不可逆操作。

### 2.3 Core Skills：核心技能层

| Skill | 核心责任 | 可独立使用的典型输入 | 标准产物 |
|---|---|---|---|
| `app-evidence-collector` | 现用现取数据、规范来源和新鲜度 | App、关键词、品类、URL、数据清单 | Signal / Evidence |
| `app-signal-radar` | 热点、GitHub、搜索、流量、商店异常聚类与路由 | 主题、国家、时间窗、原始信号 | Confirmed signals |
| `app-route-competitor-validated` | Engine A 竞品验证、微创新、路线内最终评选 | 竞品、品类、商店、用户或宽泛扫描 | A 路线候选与最终5个 |
| `app-route-gap-redesign` | Engine B 市场缺口和第一性原理重构 | 用户任务、人工流程、工具拼接、被忽略人群 | B 路线候选与最终5个 |
| `app-route-emerging-demand` | Engine C 新需求和趋势机会 | 热点、技术、人群、搜索、GitHub、讨论或流量变化 | C 路线候选与最终5个 |
| `app-workbench-packager` | 把路线入选项目变成完整开发资料包 | `ROUTE_SELECTED` Candidate + Evidence | `READY_FOR_BENCH` Package |
| `app-selection-publisher` | 生成周/即时报告并保存到既有统一网站 | 三条路线结果、资料包和来源 | Markdown / website-report JSON / 入库回执 |
| `app-selection-feishu-publisher` | 生成、校验并幂等发送单份选品报告飞书卡片 | website-report JSON、报告URL、生产资料包URL | feishu-card JSON / 发送回执 |
| `app-development-scheduler` | 根据真实开发能力排期，不改变选品 | Ready Packages、开发台状态、窗口期 | Development Schedule |
| `app-outcome-calibrator` | 用发布结果分别校准信号和路线方法 | 下载、留存、收入、成本、停止原因 | 路线校准建议 |

其中，当前安装的 `app-opportunity-scout` 是 Engine A 的现有实现，可以兼容为 `app-route-competitor-validated`；其他名称是目标能力边界，只有真正创建并验证后才标记为已实现。

### 2.4 Shared Contracts & Evidence Ledger：共享契约层

共享的是事实结构和调用协议，不是评分逻辑：

- `schemas/skill-task.schema.json`：任何入口如何调用一个 Skill；
- `schemas/skill-result.schema.json`：Skill 如何报告状态、产物、证据、假设和错误；
- `schemas/signal-event.schema.json`：趋势信号；
- `schemas/reference-evidence.schema.json`：竞品、替代方案、workaround、领先信号和实验；
- `schemas/opportunity-candidate.schema.json`：带路线归属、路线分数和路线内排名的候选；
- `schemas/workbench-package.schema.json`：完整开发台资料包。

候选契约必须携带 `product_form` 与真实目标平台，参考证据契约必须携带 `entity_kind`、`url`、`store_url` 和 `store`。枚举和值域统一遵循 `docs/14-产品形态与参考对象分类规范.md`。

`requested_skill` 使用可扩展的 kebab-case 名称，不在 Schema 中写死 Skill 枚举。这样可以增加新能力或接入外部 Skill，同时仍由 Loop 在运行时检查该 Skill 是否存在、版本是否兼容以及是否支持所请求的 operation。

证据账本必须保留：

- 来源、URL、市场、平台、时间范围和采集时间；
- `official / estimate / observed / internal / hypothesis`；
- 来源运行、父任务和生成 Skill；
- 规则版本和输入快照；
- 决策、失败、重试和人工修改记录。

### 2.5 Output Surfaces：交付层

输出分为四类：

1. 路线结果：三条路线各自的候选、最终5个、备选和观察；
2. 开发输入：默认15个完整工作台资料包；
3. 经营界面：同一个网站中的周报告、即时报告、历史时间线和证据详情；
4. 经营通知：报告入库后发送一次飞书互动卡片，也可在网站中按报告单独推送；
5. 执行队列：独立开发排期、开发台状态、QA、RC 和发布状态。

网站可以同时展示三条路线，但不能生成跨路线总分或混合排行榜。

### 2.6 Outcome Feedback：结果校准层

真实发布结果分别回流到：

- 信号来源命中率；
- Engine A 的竞品和痛点评分；
- Engine B 的缺口、迁移和结果改善评分；
- Engine C 的信号持续性、窗口期和行为验证评分；
- 资料包完整度与返工率；
- 开发排期和工厂复用效率。

校准 Skill 可以提出规则变更，但不能直接覆盖生产方法版本；必须生成差异、依据和回滚方式。

## 3. 两种调用模式

### 3.1 Loop 编排调用

```text
用户目标
  → Loop 建立 run contract
  → 创建 Skill Task Envelope
  → 调用一个或多个核心 Skill
  → 校验 Skill Result Envelope
  → 根据依赖继续下一个 Skill
  → 汇总、QA、改进和交付
```

适合：

- 每周三路线完整运行；
- 一次性宽泛市场扫描；
- 从信号到选品、资料包和网站的全链路；
- 多步骤复评和经营结果校准。

### 3.2 Skill 独立调用

```text
自然语言 / URL / 文件 / API数据
  → Skill 自己创建 task_id 和 run_id
  → Input Adapter 标准化
  → 执行本 Skill 完整方法和门禁
  → 输出标准结果与可读报告
  → 可选导入 Loop 或网站
```

适合：

- “分析这个 App 和它的竞品”；
- “从这些评论里挖掘痛点”；
- “研究这个人工工作流是否有市场缺口”；
- “分析这个热点会不会形成新需求”；
- “把这个已入选候选生成工作台资料包”；
- “只根据这批资料生成网站数据”。

独立使用不等于降低要求。除非明确使用 `research_only`，否则同一 Skill 的证据门槛、评分和停止条件与 Loop 调用完全一致。

## 4. 双模式兼容协议

每个核心 Skill 必须满足：

### 输入兼容

- 接受自然语言；
- 接受标准 Task Envelope；
- 接受本地路径、URL和内联 JSON；
- 允许只提供部分字段，并记录默认假设；
- 不要求调用方了解项目内部目录；
- 不要求存在 Auto Loop 才能运行。

### 执行一致

- 两种调用共用同一个核心工作流；
- 两种调用共用同一评分和证据门禁；
- 输入来源不同不能改变结论标准；
- 所有输出有 `skill_name`、`skill_version`、`methodology_version` 和 `run_id`；
- 默认不覆盖历史运行。

### 输出兼容

- 返回统一 Result Envelope；
- 同时生成机器可读和人可读结果；
- 明确 `completed / partial / blocked / failed`；
- 明确事实、估算、观察、假设和缺失数据；
- 产物路径可被 Loop、网站或其他 Skill 继续消费。

### 副作用边界

- 研究 Skill 默认只读外部来源；
- 本地写入限定在当前运行目录；
- 发布、部署、购买、登录、商店提交和不可逆操作需要单独授权；
- 重试必须幂等，不得重复发送或覆盖旧运行。

## 5. 标准任务信封

最小示例：

```json
{
  "contract_version": "1.0",
  "task_id": "task-2026w31-a",
  "requested_skill": "app-route-competitor-validated",
  "invocation_mode": "loop",
  "operation": "weekly_selection",
  "input": {
    "direction": "all-markets",
    "candidate_pool_count": 20,
    "final_selection_count": 5
  },
  "context": {
    "parent_run_id": "weekly-2026-w31",
    "project_root": "/Users/xmm/projects/APP选品系统"
  },
  "output": {
    "format": ["json", "markdown"],
    "non_overwrite": true
  }
}
```

独立调用只需把 `invocation_mode` 改为 `standalone`；如果用户没有提供 JSON，Skill 的输入适配器负责生成它。

## 6. 标准结果信封

```json
{
  "contract_version": "1.0",
  "task_id": "task-2026w31-a",
  "run_id": "run-2026w31-a",
  "skill_name": "app-route-competitor-validated",
  "skill_version": "1.0",
  "status": "completed",
  "artifacts": [
    {
      "artifact_type": "route_candidates",
      "path": "content/2026-W31/engine-a/candidates.json"
    }
  ],
  "metrics": {
    "candidate_pool_count": 20,
    "route_selected_count": 5
  },
  "assumptions": [],
  "warnings": [],
  "next_actions": []
}
```

`partial` 必须说明缺少什么；`blocked` 必须说明阻塞类型和需要谁提供什么；不得把研究计划写成已完成结果。

## 7. 完整周运行联动

```text
Auto Loop
  ├─ 调用 Evidence Collector 和 Signal Radar
  ├─ 调用 Route A → 独立最终5个
  ├─ 调用 Route B → 独立最终5个
  ├─ 调用 Route C → 独立最终5个
  ├─ 对15个入选逐个调用 Workbench Packager
  ├─ 调用 Publisher 更新报告和网站数据
  ├─ 调用 Development Scheduler 生成独立排期
  └─ 后续调用 Outcome Calibrator 回收经营结果
```

允许部分运行：

- 只跑一个数据源；
- 只跑一个路线；
- 指定每条路线需要几个；
- 只生成资料包；
- 只发布已有结果；
- 只复评历史候选；
- 只校准某条路线。

## 8. Skill 完整性标准

一个能力只有满足以下条件，才能从“架构接口”标记为“已实现 Skill”：

1. 有清晰触发描述和独立 `SKILL.md`；
2. 声明支持的 operations、输入类型和输出类型；
3. 能处理 Loop Envelope 和独立输入；
4. 有独立运行目录和不可覆盖机制；
5. 有领域门禁、失败模式和暂停条件；
6. 输出通过共享 Schema；
7. 至少通过一个 Loop 调用测试和两个独立调用测试；
8. 错误输入、缺数据和重复调用均有验证；
9. 不依赖未声明的对话上下文；
10. 文档没有把尚未接入的数据或外部能力写成已完成。

## 9. 当前实现状态

| 能力 | 当前状态 |
|---|---|
| Auto Loop 总控方法 | 已安装，可用于编排 |
| `app-selection-loop` 完整选品总控 | 已安装；支持完整、单路线、资料包、发布、刷新和恢复模式 |
| Engine A `app-opportunity-scout` | 已安装；需要按本协议补齐标准 Envelope 适配 |
| Engine B Skill | 架构已定义，未创建 |
| Engine C Skill | 架构已定义，未创建 |
| Workbench Packager | Schema、模板和脚本已存在；尚未封装成独立 Skill |
| Signal / Evidence Schema | 已存在 |
| Task / Result Envelope | Schema 与示例已定义 |
| Publisher Skill | 未创建 |
| Scheduler Skill | 未创建 |
| Outcome Calibrator Skill | 未创建 |
| 真实数据连接和网站 | 未实现，不得声称已上线 |

## 10. 推荐实施顺序

1. 使用已安装的 `app-selection-loop` 作为唯一总控入口；
2. 升级 Engine A，使其通过双模式兼容测试；
3. 按同一骨架创建 Engine B、Engine C；
4. 把现有资料包脚本封装为 Workbench Packager Skill；
5. 创建 Evidence Collector 与 Signal Radar；
6. 创建 Publisher；
7. 创建独立 Scheduler；
8. 在真实发布数据出现后创建 Outcome Calibrator；
9. 用真实周运行逐步替换总控中的 inline fallback。
