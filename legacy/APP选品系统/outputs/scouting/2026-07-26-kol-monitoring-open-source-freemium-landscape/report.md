# KOL 监控与推送：开源 / 免费商业产品精选 10 个

- Run ID: `2026-07-26-kol-monitoring-open-source-freemium-landscape`
- 调查日期：2026-07-26
- 模式：定向参考对象调查
- 目标：为 `变化检测 → 原文证据 → AI 解释 → 人工确认 → 分派/推送` 寻找可复用底座和低成本验证工具
- 状态：`completed`

## 结论

最值得直接复用的开源组合是：

```text
RSSHub（把公开内容转成 RSS）
  + changedetection.io（网页变化、差异证据、AI 摘要）
  + FreshRSS（聚合、关键词 Webhook、LLM 分类）
  + 现有飞书推送服务（人工确认、幂等发送）
```

如果只想用一周验证需求，不部署服务器，优先试：

```text
Talkwalker Alerts（人物/品牌/X 提及）
  + Visualping（关键网页变化 + AI 摘要）
  + Inoreader Free（统一阅读）
```

商业免费版适合 2–10 个重点对象的验证。现有 `Creator Guard` 面向 20–300 名达人、`Signal Relay` 面向 20–100 个关键账号，不能把免费额度误当生产容量。

## 评分方法

这是“参考对象适配分”，不是 App 立项分：工作流覆盖 30、试用/部署成本 20、证据可追溯 15、推送与集成 15、成熟度与活跃度 10、数据边界风险 10，共 100 分。GitHub Star 是采用与社区信号，不代表用户需求或产品质量。

## 精选排名

| 排名 | 项目 | 类型 | 适配分 | 最值得借鉴 / 复用 | 主要限制 |
|---:|---|---|---:|---|---|
| 1 | [changedetection.io](https://github.com/dgtlmoon/changedetection.io) | 开源，Apache-2.0 | 94 | CSS/XPath/JSON 差异、截图、REST API、多通道通知；已支持接入自选 LLM 做重要性判断和自然语言摘要 | 社交平台登录态和反爬仍要逐源处理；LLM 调用费另计 |
| 2 | [RSSHub](https://github.com/DIYgod/RSSHub) | 开源，AGPL-3.0 | 91 | 把大量公开网站和社交来源标准化成 RSS；很适合作为 KOL 来源接入层 | 路由会随平台接口变化失效；部分来源需要 Cookie、代理或自托管 |
| 3 | [FreshRSS + Extensions](https://github.com/FreshRSS/FreshRSS) | 开源，AGPL-3.0 | 89 | 自托管聚合；官方扩展已有关键词 Webhook 和 OpenAI-compatible LLM 分类，最接近“聚合→筛选→推送” | 不原生维护“同一 KOL 观点版本”；需要自建实体与证据模型 |
| 4 | [Visualping](https://visualping.io/) | 商业，长期免费套餐 | 88 | 免部署网页监控；免费版也有 AI 变化摘要、IMPORTANT 判断、API/Webhook/Zapier | 免费仅 5 页、150 次检查/月；原生 Slack/Teams 团队能力在商业版 |
| 5 | [Huginn](https://github.com/huginn/huginn) | 开源，MIT | 86 | 可自托管的事件 Agent 图；网页、RSS、Webhook、JavaScript、邮件/Slack 串联能力完整 | 学习和运维成本最高；最新正式 Release 仍是 2022 年，虽仓库近期仍有提交 |
| 6 | [Miniflux](https://github.com/miniflux/v2) | 开源，Apache-2.0 | 84 | 轻量、稳定的 RSS 后端；Webhook、REST API、Slack、Telegram、Apprise 等 25+ 集成 | 更像可靠收件箱，不提供原生 AI 观点变化与人工审核队列 |
| 7 | [Talkwalker Alerts](https://www.talkwalker.com/alerts) | 商业，免费服务 | 83 | 免费监控新闻、博客、论坛、网站和 X 提及；支持 Boolean、Email、RSS、Slack | 无公开免费容量 SLA；高级情感、历史数据和播客/评论覆盖属于付费 Social Listening |
| 8 | [Inoreader](https://www.inoreader.com/pricing) | 商业，Free forever | 82 | 免费 150 个公开 RSS 订阅、搜索和 Google News alerts，适合快速搭 KOL 阅读池 | 规则、监控源、社交源和高级自动化主要在 Pro，不能把页面上的 Pro 配额当免费额度 |
| 9 | [Distill](https://distill.io/pricing/) | 商业，长期免费套餐 | 80 | 免费 25 个监控（其中 5 个云端）、每月 1,000 次云检查、30 封邮件、100 次推送 | 云端最短 6 小时；免费版无变化历史，不适合严肃证据审计 |
| 10 | [Browse AI](https://www.browse.ai/pricing) | 商业，长期免费套餐 | 76 | 无代码录制网页操作、结构化抽取、定时监控，适合验证难做 RSS 的公开页面 | 免费 50 credits/月、2 个网站；规模很小，登录态、CAPTCHA 和站点条款风险高 |

## 逐项判断

### 1. changedetection.io — 首选变化检测内核

- 2026-07-26 GitHub 观测：约 32.5k Star；最新 Release `0.55.8` 发布于 2026-07-13。
- 能保留 before/after diff、截图和选择器规则，并通过 Email、Slack、Telegram、Webhook、自定义 API 等发送。
- 2026 年已加入可接 OpenAI、Gemini、Anthropic、Ollama 等模型的变化重要性判断和摘要。
- 对现有方案的价值：直接承接“变化检测、原文证据、AI 解释”，但“同一人物的观点版本”和“人工确认队列”仍需我们自己实现。

### 2. RSSHub — 首选公开内容接入层

- 2026-07-26 GitHub 观测：约 45.4k Star、10k Fork，当日仍有代码提交。
- 官方列出的主题覆盖 Bilibili、Instagram、TikTok、Twitter、微信、微博、YouTube、知乎等。
- 对现有方案的价值：统一输入格式，避免每个来源都从头写采集器。
- 风险：它证明技术供给成熟，不证明某个平台允许大规模抓取；必须优先官方 API、授权导出、公开 RSS 和用户主动提交链接。

### 3. FreshRSS + Extensions — 最接近可用的自托管工作台

- 2026-07-26 GitHub 观测：约 15.6k Star；最新 Release `1.29.1` 发布于 2026-05-20。
- 官方扩展仓库已有 `Webhook`（关键词命中后发 Webhook）和 `LLM Classification`；社区扩展还有摘要、翻译、Digest。
- 对现有方案的价值：最快做出来源列表、文章池、关键词筛选和飞书入口。
- 缺口：要新增 KOL 实体、claim/观点、版本差异、证据引用和人工确认状态。

### 4. Visualping — 最快验证“重要变化 + AI 摘要”

- 官方 2026-04 更新说明：免费版 5 个页面、150 次检查/月、最短 60 分钟。
- 每个免费提醒也带 AI 摘要和 IMPORTANT 分类；API、Webhook、Zapier 对免费版开放。
- 对现有方案的价值：不用部署即可验证用户是否愿意处理“重要变化”卡片。
- 不适合直接当生产底座：5 页额度远低于 KOL 监控目标，团队 Slack/Teams 原生集成在 Business。

### 5. Huginn — 最强自托管编排参照

- 2026-07-26 GitHub 观测：约 49.7k Star，仓库 2026-07-25 仍有提交。
- 可把网页、RSS、Webhook、JavaScript、邮件、Slack 等 Agent 串成有向图。
- 对现有方案的价值：参考其 Event/Agent 模型设计来源、变换、过滤和推送。
- 风险：正式 Release 停在 2022 年；不建议把 Ruby/Rails 全栈直接作为新产品核心，优先借鉴模型或做旁路 POC。

### 6. Miniflux — 轻量可靠的 RSS 后端

- 2026-07-26 GitHub 观测：约 9.5k Star；`2.3.3` 发布于 2026-07-24。
- 具备正则过滤、CSS 抽取、Webhook、REST API 和 25+ 第三方集成。
- 对现有方案的价值：如果 FreshRSS 太重，可用它做低维护来源收件箱。
- 缺口：AI 判断、观点变化和审核工作流需要外置。

### 7. Talkwalker Alerts — 免费提及发现首选

- 官方称可覆盖新闻、博客、论坛、网站和 X，支持 22 种语言、Boolean 查询。
- 可以 Email、RSS 或 Slack 接收结果；适合发现“谁提到了品牌/竞品/事件”。
- 对现有方案的价值：补足 RSSHub 之外的关键词提及发现。
- 风险：官方没有承诺免费结果的完整性、容量和历史；只能当线索源，不能当审计真相源。

### 8. Inoreader — 最省事的免费阅读池

- 官方当前标明 Free forever、无需信用卡；免费档支持 150 个公开 RSS 订阅。
- 对现有方案的价值：很快验证用户是否会持续阅读并标记 50–150 个 KOL 来源。
- 风险：规则、监控 feed、Facebook/Bluesky/Telegram 等高级来源的数字展示属于 Pro 对照列，免费档不要误读。

### 9. Distill — 免费页面监控容量较大

- 官方免费档：25 个 Monitor（5 个云端）、1,000 次云检查/月、云端最短 6 小时、30 封邮件/月、100 个手机推送/月。
- 对现有方案的价值：低频跟踪 5 个关键个人主页、公告或长文页。
- 风险：免费档无 Version History；若需要审计，必须自己保存原文快照和哈希。

### 10. Browse AI — 结构化页面抽取 POC

- 官方帮助中心标明免费档 50 credits/月、2 个网站、3 个用户、无限 Robots。
- 可录制点击/登录/抽取步骤，并定时监控结构化字段。
- 对现有方案的价值：验证某个无 RSS 页面能否抽取“标题、时间、正文、互动数”。
- 风险：免费容量仅够 POC；对社交平台使用前必须核对 API/页面条款，不以绕过 CAPTCHA 或反爬为产品前提。

## 对现有三个 KOL 方案的映射

| 现有方案 | 最相关参考 | 可直接复用 | 必须自研 |
|---|---|---|---|
| Creator Guard | changedetection.io、Visualping、Talkwalker Alerts | 页面变化、提及发现、diff、截图、Webhook | 合作达人实体、披露规则、竞品提及、风险审核与分派 |
| Thesis Watch | RSSHub、FreshRSS、Miniflux | 来源聚合、全文池、关键词/LLM 分类 | claim 抽取、同一观点版本比较、反方证据、置信度 |
| Signal Relay | FreshRSS、Huginn、Miniflux | 去重、过滤、定时 Digest、Webhook | 来源-变化-影响-负责人四段式卡片、人工确认、飞书幂等 |

## 建议下一步

只做一个 7 天技术 POC，不同时试十个：

1. 用 RSSHub 接 10 个公开 KOL 来源，用 changedetection.io 补 3 个无 RSS 页面。
2. 用 FreshRSS 聚合，配置关键词 Webhook 和 LLM Classification。
3. 复用现有飞书卡片与幂等发送，只在人工确认后推送。
4. 记录 4 个结果：采集成功率、无效提醒率、从变化到确认的时间、每条提醒的原文证据完整率。
5. 通过门槛建议：采集成功率 ≥ 90%，无效提醒率 ≤ 30%，证据完整率 100%，至少 3 名真实用户连续使用 7 天。

若 POC 达标，优先以 `RSSHub + changedetection.io + FreshRSS` 为可替换基础设施，自研证据模型和人工决策层；不要把任何单一商业免费套餐写死进产品核心。

## 未覆盖与边界

- 本次是参考对象调查，不是新的 App 立项；十项统一保持 `WATCH`，不会进入周选品池或开发台。
- 未获得各产品真实留存、付费转化、客户流失和大规模监控准确率，因此不声称它们是商业赢家。
- GitHub Star、Fork、提交和免费额度均为 2026-07-26 快照，后续可能变化。
- 未登录每个产品做端到端试用；下一步 POC 必须验证真实来源成功率、延迟、噪声和站点条款。

## 来源

- GitHub: [changedetection.io](https://github.com/dgtlmoon/changedetection.io), [RSSHub](https://github.com/DIYgod/RSSHub), [FreshRSS](https://github.com/FreshRSS/FreshRSS), [FreshRSS Extensions](https://github.com/FreshRSS/Extensions), [Huginn](https://github.com/huginn/huginn), [Miniflux](https://github.com/miniflux/v2)
- 官方产品与价格: [Visualping 免费档说明](https://visualping.io/blog/visualping-pricing-explained), [Talkwalker Alerts](https://www.talkwalker.com/alerts), [Inoreader Pricing](https://www.inoreader.com/pricing), [Distill Pricing](https://distill.io/pricing/), [Browse AI Pricing](https://www.browse.ai/pricing), [Browse AI 当前套餐帮助](https://help.browse.ai/en/articles/11429429-how-do-plans-and-pricing-work)
