# 每周选品 AutoLoop 主提示词

> 用途：每周为 Engine A 自动生成选品报告、竞品证据包、产品说明、改进策略、工作台资料包和网站发布数据。  
> 原则：整体覆盖广、数量大；单个 App 的优化点少而准。
>
> 定位更新：本文保留为 Engine A“竞品验证与微创新”的周运行子流程。需要同时调度市场缺口、新需求和趋势信号时，使用 `docs/08-多引擎选品AutoLoop总控提示词.md`。

## 可直接使用的提示词

```text
使用 $auto-loop 自动驾驶舱模式执行“Engine A 竞品验证路线周选品”。

一、长期经营目标

我们要持续生产、发行和运营 1000+ App。

经营方式：
- 全覆盖扫描不同国家、商店、品类、子品类和商业化模式；
- 以真实竞品为参考，不凭空想产品；
- 根据下载、活跃、留存、收入、评论、关键词、广告和实际体验选品；
- 研究用户正在用什么、为什么使用、为什么付费、哪里不满意；
- 每个候选只提出 1–3 个可验证改进点；
- 判断 AI 能否让核心任务更快、更准、更简单或更个性化；
- 每周在 Engine A 路线内评选 5 个最终入选和 3 个路线备选；
- 为 5 个最终入选分别生成完整工作台资料包，开发排期另行处理；
- 将结果发布到选品网站，并把开发和经营结果反馈给下周模型。

二、本周输入

week_id: {{YYYY-Www}}
data_cutoff: {{ISO_DATETIME}}
priority_countries: {{COUNTRIES_OR_ALL}}
stores: {{STORES}}
categories: {{CATEGORIES_OR_ALL}}
developer_benches: 5
primary_selection_count: 5
backup_selection_count: 3
watch_count: 12
data_sources:
  app_universe: {{APPFIGURES_OR_42MATTERS}}
  usage_retention: {{SIMILARWEB_OR_SENSOR_TOWER}}
  games: {{APPMAGIC}}
  aso_ads: {{APPTWEAK_OR_MOBILEACTION}}
  reviews: {{REVIEW_SOURCE}}
previous_week_report: {{PATH_OR_URL}}
released_app_metrics: {{PATH_OR_URL}}

三、不可违反的证据规则

1. 没有具体竞品，不进入下一阶段。
2. 每个候选必须有 1 个唯一主对应竞品（`primary_competitor`，选品与竞品 1-1）；另外至少准备 2 个直接竞品或参考对象用于交叉验证，并将它们放入 `reference_objects`，不得把参考对象误当成主对应竞品。
3. 每个关键数字必须记录：
   - 数据源；
   - 国家/地区；
   - iOS/Android/其他商店；
   - 时间范围；
   - 采集日期；
   - 是官方值、第三方估算还是内部真实数据。
4. 不得把第三方估算写成竞品后台真值。
5. 不得根据总下载量单独做决定。
6. 必须同时检查下载、活跃/留存、商业化和用户评论。
7. 数据缺失写 null 和“待验证”，不得补造。
8. 竞品学习必须区分：
   - 可以学习的需求、流程和商业机制；
   - 需要重新设计的部分；
   - 不得复制的名称、品牌、代码、美术、文案、内容和受保护资产。
9. 如果证据互相矛盾，必须展示矛盾并降低置信度。
10. 任何候选都可以被淘汰，不得为了填满 5 个开发台伪造证据。

四、每周扫描与漏斗

Step 1：更新全市场数据库
- 获取新上架、版本更新、榜单、评分、评论、下载和收入；
- 更新 3、6、12、24 个月趋势；
- 更新 DAU、WAU、MAU、Stickiness、Session、时长和 D1/D7/D30；
- 更新关键词、广告素材、投放渠道和发行商组合；
- 按国家、商店、品类、子品类、功能和玩法建立统一分类。

Step 2：机器初筛
从本周新增、更新和异常变化中生成最多 1,000 个机器候选。

优先信号：
- MAU、收入和留存长期稳定；
- 下载、MAU、收入在 3/6/12 个月同步增长；
- 更新后出现持续增长；
- 搜索需求增长；
- 多个同类竞品同时增长；
- 评论量、评分或付费持续；
- 出现跨竞品反复抱怨的问题；
- 游戏玩法下载稳定、收入增长或长期更新。

Step 3：竞品聚类
- 为每个机会建立直接竞品组和相邻产品组；
- 合并重复想法；
- 排除错误国家、错误品类和不可比较对象；
- 保留约 200 个竞品簇。

Step 4：生成 50 份 Competitor Evidence Pack
每份必须包含：
- 候选名称、品类、国家、用户和核心需求；
- 3 个直接竞品；
- 3–10 个相邻产品；
- 下载、MAU、留存、收入、评分、评论；
- 3/6/12/24 月趋势；
- 版本更新时间线；
- 功能、流程、定价、广告、订阅和 IAP；
- 用户认可价值；
- 高频痛点；
- 数据完整度和置信度；
- 来源 URL。

Step 5：深度分析 Top 20
- 实际体验至少 3 个竞品；
- 拆解首开、核心任务、价值时刻、留存循环和付费点；
- 找出用户已经被验证的需求；
- 找出多个竞品共同没有解决的问题；
- 只提出 1–3 个改进点；
- 给出不使用 AI、后台使用 AI、前台使用 AI 三种判断；
- 输出可开发的产品说明和验收指标。

五、通用评分，满分 100

- 已验证需求 20；
- 增长质量 15；
- 长期耐用 10；
- 使用与留存 10；
- 商业化 10；
- 痛点机会 15；
- 竞品参考质量 10；
- AI / 工厂复用 5；
- 获客可解释性 5。

进入主选或备选的最低条件：
- 总分 >= 75；
- 数据完整度 >= 80%；
- 至少 3 个直接竞品；
- 至少一个跨竞品反复出现的用户痛点；
- 至少一个 1–3 周可做闭环的优化点；
- 有明确继续和停止指标。

六、游戏专用 Gate

游戏不能只根据竞品数据判断“我们的版本会好玩”。

如果候选是游戏：
1. 先证明至少 3 个同玩法竞品有真实下载、活跃、留存或收入；
2. 分析玩法 Hook、首局、难度、Session、广告、IAP、LiveOps 和评论；
3. 输出 3 个灰盒玩法变体；
4. 48 小时内用至少 30 名目标玩家测试；
5. 记录教程完成率、首局完成率、主动再开一局和主观乐趣评分；
6. 只有灰盒最优变体进入开发；
7. 正式发布前进行 100–300 人、7 天封闭测试，并与同子品类基准比较。

七、本路线决策

输出：
- 5 个 ROUTE_SELECTED 最终入选；
- 3 个 ROUTE_BACKUP 路线备选；
- 12 个 ROUTE_WATCH 路线观察；
- REJECTED 清单和原因。

如果不足 5 个达到门槛：
- 如实输出不足；
- 从备选中启动数据补充或灰盒验证；
- 不得降低门槛或虚构结论。

八、每个最终入选和备选的输出

1. 一页决策卡
2. Competitor Evidence Pack
3. 产品说明
4. 竞品功能和数据对比表
5. 用户价值与痛点聚类
6. 1–3 个改进策略
7. AI 使用方式
8. 核心流程
9. 第一版范围与非目标
10. 商业化
11. 设计参考与不可复制资产
12. 数据埋点
13. QA 验收标准
14. 继续、返工和停止条件
15. 工作台资料包状态

九、工作台资料包与独立排期

- 为 5 个 `ROUTE_SELECTED` 各生成一个完整资料包；
- 资料包通过 Schema 后进入 `READY_FOR_BENCH`；
- 开发排期根据实际产能领取，不改变 Engine A 路线排名；
- 没有被领取的资料包保持待开发状态。

十、网站发布

生成网站可读取的结构化数据和 Markdown：

- weekly_report;
- market_pulse;
- top_20;
- route_selected_5;
- route_backup_3;
- route_watch_12;
- candidate_details;
- competitor_evidence;
- review_themes;
- product_briefs;
- improvement_strategies;
- bench_status;
- released_app_feedback;
- data_sources;
- methodology_version.

页面必须可以按周、产品形态、国家、商店、品类、状态、分数和开发台筛选。候选必须标注 `product_form` 和真实目标平台；每个参考对象必须标注 `entity_kind`。真实移动 App / 游戏链接官方商店，非 App 对象链接其官方页或证据来源。字段和值域遵循 `docs/14-产品形态与参考对象分类规范.md`。

十一、输出顺序

先输出一页周决策摘要，再输出证据：

A. 数据范围、更新时间和缺口
B. 本周市场脉搏
C. Top 20 表格
D. Engine A 最终入选 5 个
E. 3 备选
F. 12 观察
G. 淘汰与原因
H. 每个最终入选的完整资料包和备选说明
I. 独立开发排期队列
J. 网站发布文件
K. 下周需要补充的数据

十二、AutoLoop 质量循环

执行以下内部角色：
- 数据研究员：检查来源、时间范围和异常；
- 用户研究员：检查评论是否真的证明需求；
- 产品负责人：检查竞品学习与改进点；
- 游戏评测员：检查玩法证据与可玩测试；
- 开发负责人：检查一周可交付性；
- QA：检查验收标准；
- 批评者：寻找数据幻觉、幸存者偏差和“为了凑数”的候选；
- 集成者：修正后发布。

完成前必须：
- 检查所有关键数字有来源；
- 检查没有把估算写成真值；
- 检查每个最终入选有真实竞品；
- 检查每个改进点能对应用户证据；
- 检查开发排期与选品结果相互独立；
- 完成至少一轮改进；
- 保存报告、表格和网站数据。
```

## 周运行输入示例

```yaml
week_id: 2026-W31
data_cutoff: 2026-07-31T23:59:59+08:00
priority_countries:
  - US
  - GB
  - DE
  - JP
  - SG
stores:
  - Apple App Store
  - Google Play
  - Amazon Appstore
  - Huawei AppGallery
categories: ALL
developer_benches: 5
primary_selection_count: 5
backup_selection_count: 3
watch_count: 12
data_sources:
  app_universe: 42matters
  downloads_revenue: Appfigures
  usage_retention: Similarweb
  games: AppMagic
  aso_ads: MobileAction
  reviews: 42matters + official store pages
```

## 使用边界

如果尚未接入付费数据或 API，可以使用公开数据生成演示报告，但必须标记为 `DEMO / RESEARCH_ONLY`，不能作为真实开发立项依据。

## 与随时选品技能的衔接

每周 AutoLoop 是固定生产节奏；`$app-opportunity-scout` 是任意时间发起的研究入口。

周任务开始时，增加以下输入：

```yaml
scouting_runs:
  - outputs/scouting/2026-07-29-japan-senior-tools/
  - outputs/scouting/2026-07-30-cozy-merge-games/
```

AutoLoop 对这些运行结果执行：

1. 校验 `run.json`、`candidates.csv`、`evidence.csv` 和来源链接；
2. 只接收评分不低于 75、数据完整度不低于 80%、至少 3 个直接竞品的候选；
3. 对过期或冲突数据重新采集，不直接继承旧分数；
4. 把合格候选加入当周 Engine A 路线池，只与 Engine A 全市场结果重新排序；
5. 保留原始 `run_id`，使路线决策可以追溯到即时研究；
6. 进入路线最终 5 个后生成资料包，但何时获得开发台由独立排期决定。

随时调用示例：

```text
使用 $app-opportunity-scout 宽泛扫描当前市场，输出 20 个机会和 5 个深度方案。
使用 $app-opportunity-scout 定向研究日本老年人工具类 App。
使用 $app-opportunity-scout 围绕指定竞品扩展机会。
使用 $app-opportunity-scout 挖掘增长快但评论痛点明显的轻量游戏玩法。
使用 $app-opportunity-scout 复评某个历史候选。
```

完整规则见 `docs/06-随时选品侦察技能使用与接入规范.md`。
