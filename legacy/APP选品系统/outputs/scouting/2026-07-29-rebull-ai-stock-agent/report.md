# RebBull 案例复刻创新与正式 App 选品报告

> Run: `2026-07-29-rebull-ai-stock-agent`  
> 采集时间：2026-07-29（Asia/Singapore）  
> 模式：`competitor-expand`  
> 决策合同：最多 3 个 SELECTED + 1 个 BACKUP + 1 个 WATCH

## 1. 范围、假设与访问限制

本轮以 RebBull 为案例锚点，研究 AI 股票分析 Agent，但不把单一案例自动视为市场验证。账号文件仅用于已授权登录尝试；凭证、Cookie 和 Token 均未进入产物。

RebBull 在本工作环境的浏览器访问出现 `ERR_CONNECTION_CLOSED`，命令行 HTTPS 连接也超时，未进入登录页或 VIP 核心流程。公开 WHOIS 显示 `rebull.cn` 注册于 2026-06-29，距本次采集约 30 天；公开检索没有发现开发者文档、OpenAPI、SDK 或授权条款。因此本报告对 RebBull 的精确页面、实际模型、数据供应商和私有接口保持 `unknown`，不把推测写成实测。

## 2. RebBull 案例结论

### 可确认

- 用户给定定位：AI 分析股票的 Agent 工具，并已有 VIP 付费账户。
- 产品形态：Web 案例，域名 `rebull.cn`。
- 域名很新、外部公开足迹极少，当前不能用公开证据证明下载、MAU、留存、收入或长期稳定性。
- 当前环境无法完成只读登录体验，因此没有把任何内部页面或输出称为已观察事实。

### 可学习机制（基于赛道而非对 RebBull 私有实现的断言）

1. 自然语言输入证券与研究问题；
2. 调用行情、基本面、公告、新闻、研报和技术指标工具；
3. 把结果组织为结构化观点、风险和可视化；
4. 通过 VIP 配额、深度报告、组合数量或高频监控收费。

### 必须重构

- 从“AI 给结论”改为“证据、口径、时间点、计算公式和反方观点可追溯”；
- 从一次性个股报告改为持仓论点的持续变化检测；
- 从事后看涨跌改为按历史可知信息进行无穿越复盘；
- 金融数值由确定性工具计算，LLM 负责规划、解释和组织，不负责凭空计算；
- 自动交易与研究产品完全隔离。

### 禁止复制

- RebBull 的品牌、UI、文案、VIP 内容、模型输出、提示词、私有数据、Cookie、Token 和未公开接口；
- 未获得商业许可的数据再分发；
- 收益承诺、确定性买卖建议和冒充持牌投顾。

## 3. 3+1+1 正式决策

| 排名 | 候选 | 决策 | 分数 | 完整度 | 核心差异 |
|---:|---|---|---:|---:|---|
| 1 | StockProof 证析 | SELECTED | 82 | 86% | 数字可追溯、公式可复算、强制多空与未知项 |
| 2 | PositionGuard 持仓哨兵 | SELECTED | 83 | 84% | 从新闻流改为“持仓论点变化检测” |
| 3 | ReplayLab 投研复盘 | SELECTED | 77 | 81% | as-of 历史重建、无未来信息泄漏、错误归因 |
| 4 | MarketBridge 跨市研究 | BACKUP | 73 | 77% | A/H/US 统一口径；数据授权与成本尚未闭环 |
| 5 | TradePilot 交易驾驶 | WATCH | 79 | 75% | 分数高但触发自动交易、牌照、适当性与授权硬门槛 |

说明：分数只在 Engine A 内比较。TradePilot 即使达到 75，也因合规与真实资金硬门槛不能正式入选。

## 4. 正式主选深拆

### 4.1 StockProof 证析

**目标用户与任务**：自主研究 A 股/港美股、需要快速核验个股但不愿盲信 AI 的投资者；一次完成“问题 → 数据 → 证据 → 计算 → 多空结论 → 未知项”。

**三个改变**

1. 每个关键数字绑定来源、口径、时点和原文页；
2. 强制输出多方、空方、冲突来源和未知项；
3. 财务比率由确定性计算器生成，保存公式与输入。

**最小闭环**：证券搜索、三源检索、公告/财务/事件工具、证据卡、多空结论和可分享报告。

**验证/停止**：30 个 A 股问题与问财/妙想对照；引用命中率 ≥95%、关键数值一致率 ≥98%、10 名用户中至少 6 名愿连续使用。任一关键准确率门槛连续两轮未达即停止。

### 4.2 PositionGuard 持仓哨兵

**目标用户与任务**：管理 5–30 只持仓或自选股的用户；每天只知道“哪些新事实改变了原来的持仓理由”。

**三个改变**

1. 建仓时记录论点、证伪条件和阈值；
2. 仅推送新增、反转或越阈信息，而非重写新闻摘要；
3. CSV/手工导入也可用，每次同步展示仓位时点与差异。

**最小闭环**：持仓导入、论点卡、事件规则、每日差异、风险确认和静默。

**验证/停止**：20 名用户连续 14 天；有效告警点击率 ≥35%、错误仓位率 <1%、每周留存 ≥50%。否则收缩到单市场、单一事件类型。

### 4.3 ReplayLab 投研复盘

**目标用户与任务**：想验证历史判断、避免事后诸葛亮的投资者与内容创作者；按历史时点重建“当时能知道什么”。

**三个改变**

1. 研究问题支持 as-of 日期并屏蔽未来资料；
2. 自动把判断拆成命题，在 7/30/90 天后回填结果；
3. 将错误区分为数据、推理、执行和随机性。

**最小闭环**：历史数据快照、论点拆分、结果回填、误差分类和个人校准面板。

**验证/停止**：50 条历史问题的未来信息泄漏率必须为 0；用户能在 5 分钟内完成一次复盘。无法取得合法历史数据授权则停止。

## 5. 竞品、用户价值与重复痛点

### 已验证价值

- [同花顺问财](https://apps.apple.com/cn/app/%E5%90%8C%E8%8A%B1%E9%A1%BA%E9%97%AE%E8%B4%A2-ai%E6%8A%95%E8%B5%84%E5%8A%A9%E6%89%8B/id1222204519)：自然语言选股、个股多维分析、事件预测和自选监控；App Store 当前为 4.5 分、730 个评分。评分数只作为使用代理，不等于 MAU 或留存。
- [东方财富妙想](https://apps.apple.com/cn/app/%E5%A6%99%E6%83%B3/id6469681957)：问答溯源、研报总结、自动图表、宏观/行业/企业数据与行情跟踪。
- [TipRanks](https://mcp.tipranks.com/)：评分、分析师观点、新闻、组合分析，并提供正式 API/MCP。
- [Danelfin](https://danelfin.com/pricing/annual)：AI Score、技术/基本面/情绪信号、组合和付费 API。
- [Fiscal.ai](https://docs.fiscal.ai/docs/guides/mcp-skills)：基于 as-filed 数据的研究工具、来源链接和 agent skills。

### 重复痛点

- 数据时点、持仓同步和余额错误会直接摧毁信任；
- AI 分数短期波动，但产品常没有充分解释概率、置信度和适用窗口；
- 付费墙重、试用边界和分层价格不清；
- 许多产品能总结，却不能重建“当时可知信息”或校准历史判断；
- 多市场的币种、会计口径、交易时间和证券实体难统一。

## 6. 推荐技术架构

```text
授权数据源
  ├─ A股：Tushare/JQData/交易所公告/公司IR
  ├─ 美股：SEC EDGAR/Alpha Vantage/TipRanks/Fiscal.ai
  └─ 新闻与事件：有商业展示权的供应商
        ↓
采集与规范化层
  → 证券主数据、时区/币种、复权、会计口径、版本与as-of时间
        ↓
存储层
  → 时序库 + 关系库 + 文档对象存储 + 向量索引 + 缓存
        ↓
确定性金融工具
  → 财务比率、技术指标、事件差异、组合暴露、费用/滑点
        ↓
Agent 编排层
  → 任务规划 → 工具调用 → 检索 → 冲突检测 → 引用校验 → 报告
        ↓
应用层
  → 个股研究 / 持仓哨兵 / 历史复盘
        ↓
治理层
  → 数据许可、审计日志、模型评测、用量计费、合规提示、敏感操作隔离
```

推荐采用“模型无关的工具层 + 可替换 LLM 路由”。核心护栏：

- 每个答案保留 `as_of`、来源 ID、抓取时间和计算版本；
- LLM 不直接生成价格、财务数值或收益率；
- 引用缺失或冲突未解决时降级输出，不补全猜测；
- 离线基准覆盖数值一致性、引用命中、时间穿越、冲突处理、延迟和成本；
- 真实交易凭证不进入研究 Agent。

## 7. 能否直接通过接口取数据

### RebBull

**结论：不建议使用。** 当前未发现公开、授权、稳定的 RebBull API。即使未来登录后在浏览器网络面板看到 JSON，也只能证明网页使用私有接口，不能证明我们具有自动调用、批量保存、再分发或商业使用权。Cookie、CSRF、签名和限流也使私有接口不稳定。只有拿到书面 API/数据授权与用途范围后，才可改为“需商务授权”。

### 可替代的合法接口

| 数据源 | 判断 | 可用范围 |
|---|---|---|
| [Tushare Pro](https://www.tushare.pro/document/2?doc_id=130) | 需按套餐与条款授权 | A 股基础、行情、财务等；有 Python 与 HTTP API |
| JQData | 需商务授权 | A 股量化/基本面/宏观，商用展示与再分发需单独确认 |
| 交易所/公司公告 | 可直接使用原始事实，仍需遵守站点与版权规则 | 公告、财报与披露；适合作为一手事实层 |
| [SEC EDGAR](https://www.sec.gov/about/webmaster-frequently-asked-questions) | 可直接使用公开 REST 数据，遵守访问规范 | 美股 filings、submissions、XBRL |
| [Alpha Vantage](https://www.alphavantage.co/documentation/) | 需按免费/付费套餐与商用条款 | 行情、基本面、新闻情绪、技术指标 |
| [TipRanks API/MCP](https://mcp.tipranks.com/) | 可按公开配额试验；商用需付费/企业授权 | 评级、新闻、技术面、组合等 |
| [Danelfin API](https://danelfin.com/pricing/annual) | 需付费授权 | AI Score、历史评分、组合相关数据 |
| [Fiscal.ai API](https://fiscal.ai/) | 需按 API 计划授权 | 全球财务、KPIs、filings、来源链接 |

产品应采购并组合数据源，而不是“把 RebBull 网页当数据库”。

## 8. BACKUP、WATCH 与否决

- **MarketBridge 跨市研究 — BACKUP**：需求成立，但数据完整度 77%、路线分 73；先核算 A/H/US 商业数据成本与展示权。
- **TradePilot 交易驾驶 — WATCH**：Composer 的官方数据证明自然语言策略/回测/执行已有明确需求，但自动交易涉及牌照、地区适用性、适当性、券商权限和真实资金风险。只允许 paper/shadow，不进入真实交易开发。
- **否决的泛化方向**：纯 AI 涨跌预测、无来源荐股排行榜、KOL 情绪复制器、抓私有接口的数据镜像、承诺收益的自动跟单。否决原因分别是不可验证、缺少差异、版权/隐私/授权风险和金融合规风险。

## 9. 缺失证据与下一步

1. 在可访问 RebBull 的网络环境完成一次只读 VIP 流程：主页 → 搜索一只股票 → 生成报告 → 查看引用/时间点 → 导出/收藏；不得下单或授权券商。
2. 保存脱敏的功能与接口观察：只记录端点用途、认证类型、响应字段类别和授权说明，不保存 Cookie/Token/原始付费数据。
3. 获取至少一个 A 股商业数据报价，核算 100/1,000/10,000 用户成本。
4. 对三个 SELECTED 各做 10 名访谈与一个 1–2 周原型测试。
5. 若 RebBull 后续公开数据与本报告推断冲突，以实测为准并执行 refresh，不覆盖本 run。

## 10. 来源

- https://apps.apple.com/cn/app/%E5%90%8C%E8%8A%B1%E9%A1%BA%E9%97%AE%E8%B4%A2-ai%E6%8A%95%E8%B5%84%E5%8A%A9%E6%89%8B/id1222204519
- https://apps.apple.com/cn/app/%E5%A6%99%E6%83%B3/id6469681957
- https://ai.eastmoney.com/nlink/
- https://apps.apple.com/us/app/tipranks-stock-market-analysis/id1237516490
- https://mcp.tipranks.com/
- https://play.google.com/store/apps/details?id=com.danelfin.app
- https://danelfin.com/pricing/annual
- https://support.danelfin.com/hc/en-us/articles/4404381785233-How-does-Danelfin-analyze-stocks
- https://fiscal.ai/
- https://docs.fiscal.ai/docs/guides/mcp-skills
- https://support.simplywall.st/hc/en-us/articles/10072135570063-Understanding-the-Subscription-Plan-Limits
- https://www.composer.trade/
- https://api.composer.trade/docs/index.html
- https://tushare.pro/document/2?doc_id=
- https://www.tushare.pro/document/2?doc_id=130
- https://www.alphavantage.co/documentation/
- https://www.sec.gov/about/webmaster-frequently-asked-questions
