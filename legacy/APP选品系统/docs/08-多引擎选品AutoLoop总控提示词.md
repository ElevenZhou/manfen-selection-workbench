# 多引擎选品 AutoLoop 总控提示词

> 用途：统一执行趋势信号扫描、三引擎机会发现、即时选品、周选品和候选复评。  
> 默认：自动补齐非关键输入，真实数据缺失时输出研究结果和缺口，不编造数字、不伪造完成状态。

## 可直接复制的提示词

```text
使用 $app-selection-loop 连续执行“多引擎 App 机会发现与选品系统”。

把本提示词作为目标合同，由app-selection-loop自动发现并调度项目Skills、外部Skills、连接器、工具和本地方法。除真实阻塞外，不要求用户逐步触发下一环节。

一、经营目标

我们要持续生产、发行和运营 1000+ App。

不是随机生成想法，而是使用以下能力系统：
1. 输入适配与证据、趋势能力；
2. 三条独立选品路线；
3. 工作台资料包、报告网站和开发排期能力；
4. 发布经营结果回流。

Auto Loop只负责组织这些独立Skills，不替任何路线评分。每个核心Skill既能接受本总控的标准任务信封，也能接受自然语言、URL、文件、API数据或历史run独立执行。

整体候选数量要大、覆盖要广；每个具体 App 只保留 1–3 个关键改变。

二、本次运行模式

operation_mode: {{AUTO | SIGNAL_SCAN | ON_DEMAND | WEEKLY_SELECTION | REFRESH | METHOD_CALIBRATION}}
requested_engine: {{AUTO | COMPETITOR_VALIDATED | GAP_REDESIGN | EMERGING_DEMAND}}
direction: {{ALL_OR_SPECIFIC_DIRECTION}}
countries: {{ALL_OR_COUNTRIES}}
stores: {{ALL_OR_STORES}}
categories: {{ALL_OR_CATEGORIES}}
target_users: {{ALL_OR_USERS}}
data_cutoff: {{LATEST_OR_TIMESTAMP}}
candidate_pool_count_per_route: {{DEFAULT_20}}
deep_dive_count_per_route: {{DEFAULT_10}}
final_selection_count_per_route: {{DEFAULT_5}}
backup_count_per_route: {{DEFAULT_3}}
developer_benches: 5
notify_feishu: {{DEFAULT_TRUE | FALSE}}
feishu_delivery_mode: {{AFTER_WEBSITE_PERSISTENCE | MANUAL_ONLY}}

如果 operation_mode=AUTO：
- 用户指定竞品或已有App时，优先 Engine A；
- 用户指定痛点、人工流程或市场缺口时，优先 Engine B；
- 用户指定热点、新技术、人群变化或趋势时，优先 Engine C；
- 用户要求宽泛扫描时，先运行信号雷达，再并行路由三引擎；
- 多个引擎都适用时允许同时研究，但必须合并重复机会。
- 完整三引擎运行时，默认每条路线建立自己的候选池并最终选5个，共15个；
- 单独调用某条引擎时，使用final_selection_count_per_route指定数量；
- 数量不足时如实少产出，不得降低证据门槛。

三、当前项目权威

先读取：
- README.md
- docs/03-全覆盖周选品与五开发台运营规划.md
- docs/05-选品网站产品与数据规格.md
- docs/06-随时选品侦察技能使用与接入规范.md
- docs/07-多引擎选品架构与趋势信号雷达.md
- docs/10-Loop与独立技能架构.md
- schemas/*.schema.json
- config/signal-sources.example.yaml

历史文档和示例不能覆盖当前规则。

三点一、Loop编排规则

- 为每个Skill生成符合schemas/skill-task.schema.json的任务信封；
- 记录task_id、parent_run_id、requested_skill、operation、输入和输出要求；
- Skill返回结果必须符合schemas/skill-result.schema.json；
- completed才进入正常下游；partial保留产物并明确缺口；blocked不得伪装完成；failed根据retryable决定一次安全重试或停止；
- Loop只验证契约、依赖和质量，不修改路线分数；
- Skill独立调用产生的标准结果可以作为upstream_artifacts导入后续流程；
- 默认所有运行不可覆盖，所有外部副作用单独授权。
- 本项目接受的运行合同中 `notify_feishu=true`，只授权在报告成功入库后发送一次该报告的飞书概述，不授权其他消息。

四、趋势信号雷达

扫描或读取以下信号：

1. 热点讨论与事件
   - 提及增长、独立作者、跨平台扩散、持续性；
   - 区分新闻、争议、娱乐、问题和产品意图。

2. GitHub与开源
   - 总Star每日快照、Fork、Contributor、Commit、Release；
   - Release资源下载、Issue主题和同类项目增长；
   - GitHub增长首先标记为technology signal，不能自动当成C端需求。

3. 搜索趋势
   - 7/30/90天和同比趋势；
   - 增长速度、加速度、相关查询、国家扩散；
   - 区分新闻词、学习词、问题词和产品词。

4. Web与App流量
   - 1/3/6个月访问、下载、MAU和来源变化；
   - 判断增长是自然、推荐、社交还是付费；
   - 检查使用和留存是否同步。

5. 商店、技术、人口、政策和行为
   - 新App、更新、排名、下载、收入、评论；
   - 新模型、API、硬件和成本变化；
   - 年轻人和其他人群的生活阶段变化；
   - 法规、支付、隐私、工作和教育变化。

每条信号必须记录：
- signal_id；
- source_type和signal_role；
- 国家、语言、窗口；
- current_value和baseline_value；
- growth_rate、acceleration、persistence；
- problem_intent、product_intent、paid_bias；
- source_url、collected_at、value_type和confidence。

信号状态：
RAW_SIGNAL → WATCH_SIGNAL → CONFIRMED_SIGNAL → ROUTED_HYPOTHESIS。

单个热点、单个GitHub项目、单个搜索词或单个流量增长不能直接进入开发。

五、三条发现引擎

Engine A：COMPETITOR_VALIDATED
- 从已被验证的App、品类或玩法出发；
- 至少3个直接竞品；
- 同时检查下载、活跃/留存、收入、评论和实际体验；
- 找到跨竞品用户价值和痛点；
- 只提出1–3个改进点；
- 输出可学习机制、需重构部分和不可复制资产。

Engine B：GAP_REDESIGN
- 从用户任务、失败结果、人工流程、工具拼接或被忽略人群出发；
- 至少3个替代方案或真实workaround；
- 至少3类独立需求证据；
- 使用第一性原理重新定义期望结果、必要约束和最短流程；
- 不把“没有竞品”写成需求证明；
- 必须设计访谈、人工服务、原型、落地页或付费意图验证。

Engine C：EMERGING_DEMAND
- 从事件、技术、人口、搜索、讨论、GitHub或流量变化出发；
- 至少3个独立领先信号；
- 明确受影响人群、行为变化、任务和当前临时方案；
- 判断Flash / Emerging / Structural生命周期；
- 证明可以在窗口关闭前上线；
- 必须增加行为或实验验证。

六、引擎原生门禁

Engine A：
- direct_competitors >= 3；
- 有使用、商业化和评论证据；
- 至少一个跨竞品痛点。

Engine B：
- substitutes_or_workarounds >= 3；
- independent_evidence_types >= 3；
- 有可测量结果改善；
- 有低成本前置验证。

Engine C：
- independent_leading_signals >= 3；
- 有带时间点的外部变化；
- 有明确生命周期；
- 有行为、等待名单、访谈、预付或原型证据。

不得用Engine A的竞品门槛否决真正的新需求，也不得用“新需求”标签绕过现实参考和实验。

七、三条路线独立评分

- Engine A 使用竞品验证评分，只与 Engine A 候选比较；
- Engine B 使用市场缺口和第一性原理评分，只与 Engine B 候选比较；
- Engine C 使用新需求和趋势评分，只与 Engine C 候选比较；
- 每条路线采用 docs/07 定义的100分模型；
- 三条路线不得换算成统一总分，不得建立混合排行榜。

每个候选还必须建立唯一 `primary_competitor`，保证选品与主对应竞品 1-1；其他产品放入 `reference_objects` 并标注参考用途。生成网站、飞书和资料包时必须分栏展示，不能把通用竞品组复制给多个候选。

进入所属路线候选池最低条件：
- route_score >= 该路线门槛，默认75；
- data_completeness >= 80%；
- 通过所属引擎原生门禁；
- 至少两类独立证据；
- 有明确用户、任务、场景、替代方案；
- 只有1–3个关键改变；
- 有下一次验证和停止条件。

八、去重与组合

- 相同用户、任务和解决路径的候选合并；
- 同一技术不得包装成十个只有名称不同的App；
- 可以把一个结构性机会拆成产品家族，但必须说明共享能力和每个App的独立任务；
- 为每个候选记录source_engine、signal_ids、evidence_ids和父机会。

九、路线决策与开发排期

每条路线独立输出：
- 5个ROUTE_SELECTED；
- 3个ROUTE_BACKUP；
- 12个ROUTE_WATCH；
- REJECTED和原因。

完整运行默认得到15个ROUTE_SELECTED，并为每个入选项目生成资料包。三条路线不得互相挤占名额。

五开发台是下游独立排期系统：每周按实际产能从资料包队列领取项目，未领取项目继续等待。开发产能不得反向减少路线入选数量。

如果达到门槛的候选不足，必须如实少选，不得为了凑满每条路线5个而伪造证据。

十、每个深度候选输出

所有路线先输出产品形态、真实目标平台和展示标签；所有参考对象输出实际对象类型与可访问链接。真实移动 App / 游戏使用官方商店链接，非 App 对象使用官方页或证据来源。字段遵循 `docs/14-产品形态与参考对象分类规范.md`。

1. candidate_id、source_engine、source_run_id；
2. 目标市场、用户、场景和核心任务；
3. 触发信号和信号状态；
4. 直接竞品、相邻产品、替代方案或workaround；
5. 关键数字及来源、市场、周期、日期和value_type；
6. 用户正在获得的价值；
7. 重复痛点和当前付出；
8. 为什么当前供给不能解决；
9. 1–3个结果型改变；
10. AI应该在前台、后台或不使用；
11. 最小闭环和1–3周范围；
12. 商业化和获客；
13. 所属路线评分、路线内排名和方法版本；
14. 风险、反证和不可复制资产；
15. 下一次验证、继续指标和停止条件；
16. 决策与置信度。
17. 一个主品牌方向和一个备选名称；
17.1 英文工作名后必须提供简洁中文展示名；竞品、相似品和替代品也必须同时提供中文展示名；
18. 定位、品牌语气和图标方向；
19. UI视觉方向、颜色令牌、字体、核心组件和核心页面；
20. 可以参考、需要重构和禁止复制的设计元素；
21. 工作台资料包完整度。

十点一、少而精的修改方向

- 每个路线最终入选项目最少1个、最多3个核心修改方向；
- 每个修改方向必须对应具体用户证据；
- 必须说明当前方案、修改方案和预期结果变化；
- 品牌、颜色和布局更换不单独算核心创新；
- 不得堆砌功能、AI入口、游戏化和社交功能；
- 其余想法进入later，不进入本次开发范围。

十一、标准输出

使用机器可读契约：
- schemas/signal-event.schema.json
- schemas/reference-evidence.schema.json
- schemas/opportunity-candidate.schema.json

每次运行保存：

outputs/scouting/YYYY-MM-DD-方向/
  run.json
  report.md
  signals.json
  candidates.json
  candidates.csv
  evidence.json
  evidence.csv
  review-themes.csv
  website.json

十二点一、网站入库后的飞书发布

- 必须先确认统一网站已经成功保存报告，再构造飞书卡片；
- 调用独立 `app-selection-feishu-publisher` Skill，不在总控中复制卡片逻辑；
- 每张卡片只对应一份不可变报告，按 A / B / C 分栏，不做跨路线混排；
- 卡片必须包含全部最终入选项目名称及产品形态、参考对象名称及实际类型、官方商店或证据链接、生产资料包链接和报告链接；
- 英文产品名和参考品名统一显示为 `English（中文）`，英文名不得被中文翻译替换；
- 使用彩色标题栏、路线色标、粗体层级、图标、分隔线和主按钮优化阅读；
- 飞书卡片不支持任意字号，禁止声称已经设置自定义字号；
- 总控幂等键固定为 `{run_id}:feishu-summary:v1`；
- 发送前校验 JSON；HTTP 200 且 `code=0` 或 `StatusCode=0` 才算成功；
- 保存 `feishu-card.json` 和 `feishu-receipt.json`，成功后不为确认而重发；
- 缺少 Webhook、报告链接、参考品链接或 READY 资料包链接时返回明确阻塞，不伪造已发送。

每周汇总保存：

content/YYYY-Www/
  weekly-report.md
  summary.json
  signals.json
  engine-a/
    candidates.json
    decisions.json
    evidence-packs.json
  engine-b/
    candidates.json
    decisions.json
    evidence-packs.json
  engine-c/
    candidates.json
    decisions.json
    evidence-packs.json
  workbench-packages.json
  development-schedule.json
  sources.json

每个ROUTE_SELECTED生成：

outputs/workbench-packages/<package_id>/
  manifest.json
  00-package-index.md
  01-product-brief.md
  02-evidence-and-references.md
  03-brand-ui-direction.md
  04-build-master-prompt.md
  05-acceptance-criteria.md
  06-growth-plan.md
  07-analytics-and-stop.md

资料包必须通过schemas/workbench-package.schema.json。

十五、开发工作台资料包

每个路线最终入选项目必须提供：

1. 目标
   - 用户、任务、场景、价值和成功结果；
   - 本次范围和明确非目标。

2. 参考
   - 竞品、相邻产品、替代方案或领先信号；
   - 每个案例学习什么、修改什么、禁止复制什么；
   - 来源和证据ID。

3. 产品
   - 1–3个核心修改方向；
   - 核心流程、功能范围、状态、异常和边界；
   - AI作用和降级方案；
   - 商业化和数据埋点。

4. 品牌与UI
   - 主品牌名、备选名、定位和语气；
   - 独立图标方向；
   - 主色、辅助色、背景、文字、成功、警告、错误颜色；
   - 字体、间距、圆角、组件和核心页面；
   - 无障碍和深色模式要求；
   - 不得复制竞品名称、图标、配色、文案或受保护资产。

5. 工作台总提示词
   - 先读取全部资料；
   - 使用指定skills和工具；
   - 先冻结范围和验收；
   - 完成架构、实现、测试、视觉检查和改进；
   - 只在凭证、购买、外部发布或不可逆操作时暂停；
   - 输出代码、测试、截图、风险和状态。

6. 三视角验收

用户视角：
- 能否在目标场景完成核心任务；
- 首次价值时间；
- 学习成本、可信度、可恢复错误和无障碍；
- 是否明显优于当前替代方案。

项目经理视角：
- 1–3个核心改变是否全部完成；
- 是否出现范围膨胀；
- 正常、失败、重启和无权限路径；
- 自动测试、设备、性能、隐私、埋点和发布准备；
- 进度、风险、停止条件和交付物。

推广视角：
- 定位是否一句话可解释；
- 名称、图标、截图和商店文案是否独立；
- 关键词、素材角度、落地页和归因；
- 激活、留存、付费事件是否可测；
- 获客承诺是否与产品真实体验一致。

详细结构以docs/09和workbench-package Schema为准。

十二、事实完整性

- 数据缺失使用null并写明待验证；
- 第三方估算不得写成官方或竞品后台真值；
- 搜索和流量增长必须检查买量、新闻和季节性；
- GitHub增长首先表示技术兴趣，不直接表示终端用户需求；
- 热点讨论必须检查独立用户、持续性和问题意图；
- 相互矛盾的证据必须并列展示并降低置信度；
- 不得声称未执行的API接入、用户测试、网站发布或App开发已经完成。

十三、AutoLoop角色复核

在不使用外部子agent时，内部执行：
- Planner：检查目标、范围、状态机和产能；
- Signal Analyst：检查异常、基线和跨来源确认；
- Competitor Researcher：检查竞品和市场证据；
- Jobs Researcher：检查任务、workaround和市场缺口；
- Futures Researcher：检查因果链、窗口和需求寿命；
- Product Architect：检查第一性原理和最小闭环；
- Verifier：检查Schema、来源、数字和门禁；
- Critic：寻找热点幻觉、技术自嗨、幸存者偏差和凑数；
- Integrator：合并重复候选并输出最终版本。

十四、完成门槛

完成前必须：
- 所有关键结论可追溯；
- 每个候选通过所属引擎门禁；
- 三条路线均完成各自评分和路线内排名，且没有跨路线混排；
- 没有把领先信号写成已验证需求；
- 没有强制填满开发台；
- Schema输出可验证；
- 至少完成一轮批评和改进；
- 明确当前阶段、真实完成项和下一阶段入口。
```

## 最小调用示例

### 宽泛趋势扫描

```text
使用 $auto-loop 和 docs/08 的总控提示词。
operation_mode: SIGNAL_SCAN
requested_engine: AUTO
direction: ALL
自动补齐非关键输入，输出确认信号和路由建议。
```

### 市场缺口

```text
使用 $auto-loop 和 docs/08 的总控提示词。
operation_mode: ON_DEMAND
requested_engine: GAP_REDESIGN
direction: 老年人智能手机日常操作
输出10个机会和3个深度验证方案。
```

### 新需求

```text
使用 $auto-loop 和 docs/08 的总控提示词。
operation_mode: ON_DEMAND
requested_engine: EMERGING_DEMAND
direction: 新AI能力、年轻人生活阶段和搜索增长交叉机会
输出10个机会和3个深度方案。
```

### 每周正式决策

```text
使用 $auto-loop 和 docs/08 的总控提示词。
operation_mode: WEEKLY_SELECTION
读取本周全部信号、三引擎运行和上周经营数据。
每条路线分别输出5个最终入选、3个备选、12个观察；共生成15个完整资料包，并单独输出开发排期队列。
```
