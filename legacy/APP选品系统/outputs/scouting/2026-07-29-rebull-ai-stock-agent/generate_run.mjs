import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const runId = "2026-07-29-rebull-ai-stock-agent";
const collectedAt = "2026-07-29T00:30:00+08:00";

const sources = {
  iwencai: "https://apps.apple.com/cn/app/%E5%90%8C%E8%8A%B1%E9%A1%BA%E9%97%AE%E8%B4%A2-ai%E6%8A%95%E8%B5%84%E5%8A%A9%E6%89%8B/id1222204519",
  miaoxiang: "https://apps.apple.com/cn/app/%E5%A6%99%E6%83%B3/id6469681957",
  eastmoneyAi: "https://ai.eastmoney.com/nlink/",
  tipranksApp: "https://apps.apple.com/us/app/tipranks-stock-market-analysis/id1237516490",
  tipranksReviews: "https://apps.apple.com/us/app/tipranks-stock-market-analysis/id1237516490?see-all=reviews",
  tipranksApi: "https://mcp.tipranks.com/",
  danelfinApp: "https://play.google.com/store/apps/details?id=com.danelfin.app",
  danelfinPricing: "https://danelfin.com/pricing/annual",
  danelfinMethod: "https://support.danelfin.com/hc/en-us/articles/4404381785233-How-does-Danelfin-analyze-stocks",
  fiscal: "https://fiscal.ai/",
  fiscalSkills: "https://docs.fiscal.ai/docs/guides/mcp-skills",
  simplywall: "https://support.simplywall.st/hc/en-us/articles/10072135570063-Understanding-the-Subscription-Plan-Limits",
  composer: "https://www.composer.trade/",
  composerApi: "https://api.composer.trade/docs/index.html",
  tushare: "https://tushare.pro/document/2?doc_id=",
  tushareHttp: "https://www.tushare.pro/document/2?doc_id=130",
  alphaVantage: "https://www.alphavantage.co/documentation/",
  sec: "https://www.sec.gov/about/webmaster-frequently-asked-questions",
  rebull: "https://rebull.cn/"
};

const sharedCompetitors = [
  { name: "同花顺问财", nameZh: "同花顺问财", entityKind: "mobile_app", storeUrl: sources.iwencai, sourceUrl: sources.iwencai },
  { name: "东方财富妙想", nameZh: "东方财富妙想", entityKind: "mobile_app", storeUrl: sources.miaoxiang, sourceUrl: sources.eastmoneyAi },
  { name: "TipRanks", nameZh: "机构观点与股票评分", entityKind: "mobile_app", storeUrl: sources.tipranksApp, sourceUrl: sources.tipranksApi },
  { name: "Danelfin", nameZh: "AI 股票评分", entityKind: "mobile_app", storeUrl: sources.danelfinApp, sourceUrl: sources.danelfinPricing },
  { name: "Fiscal.ai", nameZh: "财务研究终端", entityKind: "web_app", storeUrl: null, sourceUrl: sources.fiscal }
];

const candidates = [
  {
    run_id: runId,
    candidate_id: "RBA-001",
    name: "StockProof 证析",
    name_zh: "证析",
    category: "Finance / Investment Research",
    type: "AI evidence-first stock research agent",
    product_form: "cross_platform",
    target_market: "中国大陆起步，后续港美股",
    target_user: "需要快速完成个股基本面与事件核验、但不愿盲信 AI 结论的自主投资者",
    core_job: "在一次会话中得到带时间戳、原文引用、反方证据和可复算指标的个股研究结论",
    source_engine: "competitor_validated",
    source_run_id: runId,
    reference_gate_type: "direct_competitors",
    signal_ids: [],
    direct_competitor_count: 5,
    data_completeness: 0.86,
    demand_score: 18,
    growth_score: 10,
    durability_score: 8,
    usage_score: 6,
    monetization_score: 8,
    pain_score: 14,
    competitor_quality_score: 9,
    ai_reuse_score: 5,
    acquisition_score: 4,
    total_score: 82,
    route_score: 82,
    route_rank: 1,
    route_methodology_version: "app-opportunity-scout-v1",
    confidence: "medium",
    decision: "SELECTED",
    improvement_1: "每个数字绑定来源、口径、数据时点和原文页，用户可一键回到证据",
    improvement_2: "强制生成多空双栏、冲突来源和未知项，不输出无条件买卖承诺",
    improvement_3: "对关键财务比率使用确定性计算器并保存可复算公式，而不是让大模型心算",
    next_validation: "用 30 个 A 股问题对比问财/妙想；引用命中率≥95%、关键数值一致率≥98%、10名用户中≥6名愿连续使用，否则停止",
    competitors: sharedCompetitors,
    product_brief: {
      positioning: "不是 AI 股神，而是可审计的个人投研工作台",
      minimum_build: "证券搜索、三源检索、财务/事件工具、证据卡片、多空结论、报告导出",
      monetization: "免费限额 + 个人 Pro 订阅；高级数据按授权成本分层",
      acquisition: "财报季/重大事件模板、可分享的证据报告、SEO 长尾问题",
      risk: "金融数据许可、引用版权、模型幻觉、用户把一般信息误解为个性化投顾"
    }
  },
  {
    run_id: runId,
    candidate_id: "RBA-002",
    name: "PositionGuard 持仓哨兵",
    name_zh: "持仓哨兵",
    category: "Finance / Portfolio Monitoring",
    type: "AI portfolio risk and thesis monitoring agent",
    product_form: "cross_platform",
    target_market: "A 股、港股、美股多市场自主管理用户",
    target_user: "持有 5–30 只标的、需要每天知道持仓论点是否被新信息推翻的投资者",
    core_job: "只推送会改变原持仓逻辑的事实、风险和待核验变化",
    source_engine: "competitor_validated",
    source_run_id: runId,
    reference_gate_type: "direct_competitors",
    signal_ids: [],
    direct_competitor_count: 5,
    data_completeness: 0.84,
    demand_score: 18,
    growth_score: 9,
    durability_score: 9,
    usage_score: 7,
    monetization_score: 9,
    pain_score: 14,
    competitor_quality_score: 9,
    ai_reuse_score: 4,
    acquisition_score: 4,
    total_score: 83,
    route_score: 83,
    route_rank: 2,
    route_methodology_version: "app-opportunity-scout-v1",
    confidence: "medium",
    decision: "SELECTED",
    improvement_1: "先记录每只持仓的原始投资论点、触发阈值和证伪条件，再做个性化监控",
    improvement_2: "以“变更检测”取代新闻摘要，只报告新增、反转或超过阈值的信息",
    improvement_3: "组合不接券商也能用 CSV/手工校验；每次同步显示仓位时点和差异",
    next_validation: "邀请 20 名持仓用户连续试用 14 天；有效告警点击率≥35%、错误仓位率<1%、每周留存≥50%，否则缩回单市场",
    competitors: sharedCompetitors,
    product_brief: {
      positioning: "从信息流升级为持仓论点的变化检测器",
      minimum_build: "持仓导入、论点卡、事件规则、每日差异摘要、风险确认与静默",
      monetization: "按持仓数和监控频率订阅；不收交易佣金、不承诺收益",
      acquisition: "免费组合体检、财报季提醒、自选股风险分享卡",
      risk: "组合数据敏感、券商同步不可靠、延迟信息可能造成错误行动"
    }
  },
  {
    run_id: runId,
    candidate_id: "RBA-003",
    name: "ReplayLab 投研复盘",
    name_zh: "投研复盘",
    category: "Finance / Decision Journal",
    type: "as-of research replay and decision journal",
    product_form: "web_app",
    target_market: "中国大陆个人投资者与投研内容创作者",
    target_user: "想验证历史判断、区分当时可知信息与事后诸葛亮的投资者",
    core_job: "按历史时点重建当时证据、结论和后续结果，形成可校准的个人决策记录",
    source_engine: "competitor_validated",
    source_run_id: runId,
    reference_gate_type: "direct_competitors",
    signal_ids: [],
    direct_competitor_count: 4,
    data_completeness: 0.81,
    demand_score: 16,
    growth_score: 8,
    durability_score: 8,
    usage_score: 5,
    monetization_score: 7,
    pain_score: 15,
    competitor_quality_score: 9,
    ai_reuse_score: 5,
    acquisition_score: 4,
    total_score: 77,
    route_score: 77,
    route_rank: 3,
    route_methodology_version: "app-opportunity-scout-v1",
    confidence: "medium",
    decision: "SELECTED",
    improvement_1: "所有研究问题支持 as-of 日期，严格屏蔽该日期之后的资料",
    improvement_2: "自动把原判断拆成可验证命题，并在 7/30/90 天后回填结果与误差原因",
    improvement_3: "分别统计数据错、推理错、执行错和运气，不用单次涨跌评价全部质量",
    next_validation: "用 50 条历史问题做时间穿越泄漏测试；未来信息泄漏率必须为 0，且用户能在 5 分钟内完成一次复盘",
    competitors: [sharedCompetitors[0], sharedCompetitors[2], sharedCompetitors[3], sharedCompetitors[4]],
    product_brief: {
      positioning: "投资者自己的可验证记忆，而不是新的荐股榜",
      minimum_build: "历史时点数据快照、论点拆分、结果回填、误差分类、个人校准面板",
      monetization: "基础日志免费；历史数据、批量回测与导出 Pro 订阅",
      acquisition: "历史热门股复盘模板、内容创作者公开成绩页",
      risk: "历史数据授权成本高、复权与幸存者偏差、回测被误读为未来收益"
    }
  },
  {
    run_id: runId,
    candidate_id: "RBA-004",
    name: "MarketBridge 跨市研究",
    name_zh: "跨市研究",
    category: "Finance / Cross-market Research",
    type: "cross-market stock research router",
    product_form: "web_app",
    target_market: "A/H/US 跨市场华语投资者",
    target_user: "需要统一比较多市场公司但不想维护多套数据口径的用户",
    core_job: "用统一指标与口径比较跨市场公司",
    source_engine: "competitor_validated",
    source_run_id: runId,
    reference_gate_type: "direct_competitors",
    signal_ids: [],
    direct_competitor_count: 5,
    data_completeness: 0.77,
    demand_score: 16,
    growth_score: 8,
    durability_score: 8,
    usage_score: 5,
    monetization_score: 7,
    pain_score: 12,
    competitor_quality_score: 8,
    ai_reuse_score: 5,
    acquisition_score: 4,
    total_score: 73,
    route_score: 73,
    route_rank: 4,
    route_methodology_version: "app-opportunity-scout-v1",
    confidence: "low",
    decision: "BACKUP",
    improvement_1: "统一币种、会计口径、交易时区和证券实体映射",
    improvement_2: "每个跨市场比较明确显示不可比项与数据缺口",
    improvement_3: "",
    next_validation: "先取得覆盖 A/H/US 且允许商业展示的报价；若数据成本无法被每用户毛利覆盖，则不进入开发",
    competitors: sharedCompetitors
  },
  {
    run_id: runId,
    candidate_id: "RBA-005",
    name: "TradePilot 交易驾驶",
    name_zh: "交易驾驶",
    category: "Finance / Automated Trading",
    type: "AI-generated strategy and trade execution agent",
    product_form: "cross_platform",
    target_market: "高风险偏好交易者",
    target_user: "希望用自然语言生成、回测并执行策略的个人用户",
    core_job: "把自然语言策略转成可回测规则并执行",
    source_engine: "competitor_validated",
    source_run_id: runId,
    reference_gate_type: "direct_competitors",
    signal_ids: [],
    direct_competitor_count: 4,
    data_completeness: 0.75,
    demand_score: 17,
    growth_score: 11,
    durability_score: 7,
    usage_score: 6,
    monetization_score: 9,
    pain_score: 11,
    competitor_quality_score: 9,
    ai_reuse_score: 4,
    acquisition_score: 5,
    total_score: 79,
    route_score: 79,
    route_rank: 5,
    route_methodology_version: "app-opportunity-scout-v1",
    confidence: "low",
    decision: "WATCH",
    improvement_1: "先输出确定性规则与费用/滑点，再允许纸面交易",
    improvement_2: "真实下单必须独立授权并逐笔确认，Agent 不持有交易权限",
    improvement_3: "",
    next_validation: "仅做 paper/shadow；取得法务、券商接口与地区合规结论前禁止连接真实资金",
    competitors: [
      { name: "Composer", nameZh: "AI 策略与自动交易", entityKind: "web_app", storeUrl: null, sourceUrl: sources.composer },
      sharedCompetitors[0],
      sharedCompetitors[1],
      sharedCompetitors[3]
    ],
    hold_reason: "需求与商业化较强，但自动交易、适当性、牌照、模型风险和接口授权形成硬门槛；高分不等于可立项"
  }
];

const evidence = [
  ["RBA-001","同花顺问财","direct",sources.iwencai,"中国","iOS","App Store rating","4.5","stars","current listing", "official","Apple App Store",sources.iwencai,"730 个评分；自然语言选股、诊股、事件预测、自选监控"],
  ["RBA-001","同花顺问财","direct",sources.iwencai,"中国","iOS","rating count","730","ratings","current listing","official","Apple App Store",sources.iwencai,"使用规模代理，不等于 MAU 或留存"],
  ["RBA-001","东方财富妙想","direct",sources.miaoxiang,"中国","iOS","covered macro indicators","1000000+","indicators","current product description","official","Apple App Store",sources.miaoxiang,"官方描述为国内外百万宏观指标"],
  ["RBA-001","TipRanks","direct",sources.tipranksApp,"美国","iOS/Web/API","MCP free monthly quota","50","calls/month","current pricing","official","TipRanks MCP",sources.tipranksApi,"免费 API key 为 10 rpm / 50 calls per month"],
  ["RBA-001","Danelfin","direct",sources.danelfinApp,"美国/欧洲","Android/Web/API","analysis features per stock","10000","features","daily model input","official","Danelfin Help",sources.danelfinMethod,"官方说明每天分析约 10,000 个特征"],
  ["RBA-001","Fiscal.ai","direct",null,"全球","Web/API","investor user claim","300000+","investors","current website","official","Fiscal.ai",sources.fiscal,"官方网站声明 trusted by over 300,000 investors"],
  ["RBA-002","Danelfin","direct",sources.danelfinApp,"美国/欧洲","Web/API","Plus annual-equivalent price","22","USD/month","annual plan","official","Danelfin Pricing",sources.danelfinPricing,"包含 3 个组合、每组合 25 个标的"],
  ["RBA-002","Danelfin","direct",sources.danelfinApp,"美国/欧洲","Web/API","Elite API quota","10000","calls/month","annual plan","official","Danelfin Pricing",sources.danelfinPricing,"Elite 标价 134 美元/月，含 API Expert"],
  ["RBA-002","TipRanks","direct",sources.tipranksApp,"美国","iOS/Web","portfolio data complaint count","3","review examples","2021-2023 reviews","observed","Apple App Store Reviews",sources.tipranksReviews,"评论反复提到持仓不同步、余额错误和更新延迟"],
  ["RBA-002","Simply Wall St","direct",null,"全球","Web","Premium portfolio limit","3","portfolios","plan limits updated 2025-07-29","official","Simply Wall St Help",sources.simplywall,"每组合 30 个持仓"],
  ["RBA-003","同花顺问财","direct",sources.iwencai,"中国","iOS","historical-date request","1","review example","2021-07-22","observed","Apple App Store",sources.iwencai,"用户请求支持调整历史日期以验证往期数据"],
  ["RBA-003","Danelfin","direct",sources.danelfinApp,"美国/欧洲","Web/API","historical AI score availability since","2017","year","Elite plan","official","Danelfin Pricing",sources.danelfinPricing,"历史日度 AI Score 可按请求提供 CSV"],
  ["RBA-003","Fiscal.ai","direct",null,"全球","Web/API","named agent research skills","20+","skills","current docs","official","Fiscal.ai API Docs",sources.fiscalSkills,"包含 watchlist-monitor、earnings-reaction、filing-finder 等"],
  ["RBA-004","Alpha Vantage","substitute",null,"全球","API","historical depth","20+","years","current docs","official","Alpha Vantage",sources.alphaVantage,"覆盖时序、基本面、新闻情绪和技术指标"],
  ["RBA-004","Tushare Pro","substitute",null,"中国","HTTP/Python API","HTTP interface","1","documented API","current docs","official","Tushare",sources.tushareHttp,"支持 POST JSON 的 RESTful 数据获取"],
  ["RBA-004","SEC EDGAR","substitute",null,"美国","REST API","company submissions and XBRL","2","JSON API families","current docs","official","SEC",sources.sec,"公司 submissions 与 extracted XBRL 可通过 data.sec.gov REST API 获取"],
  ["RBA-005","Composer","direct",null,"美国","Web/API/Brokerage","reported trading volume","37","USD billions","current website","official","Composer",sources.composer,"官方累计口径"],
  ["RBA-005","Composer","direct",null,"美国","Web/API/Brokerage","reported orders","18","million orders","current website","official","Composer",sources.composer,"官方累计口径"],
  ["RBA-005","Composer","direct",null,"美国","Web/API/Brokerage","reported rebalances","2","million rebalances","current website","official","Composer",sources.composer,"官方累计口径"],
  ["RBA-005","Composer","direct",null,"美国","REST API","documented API surface","4","capability groups","current docs","official","Composer API",sources.composerApi,"策略、部署、回测、直接交易"],
  ["ANCHOR","RebBull","anchor",null,"中国","Web","domain registration date","2026-06-29","date","WHOIS observed 2026-07-29","observed","CNNIC WHOIS","https://whois.cnnic.cn/","域名仅约 30 天；不能据此证明用户需求、留存或商业化"],
  ["ANCHOR","RebBull","anchor",null,"新加坡工作环境","Web","access result","connection closed / timeout","result","2026-07-29","observed","Browser and curl",sources.rebull,"未进入登录页面，故没有把任何 VIP 功能写成已实测事实"],
  ["ANCHOR","RebBull","anchor",null,"全球","Web/API","public API documentation","0","documented endpoints","search collected 2026-07-29","observed","Public web search",sources.rebull,"未发现公开开发者文档、OpenAPI、SDK 或授权说明"]
].map(([candidate_id,competitor,role,store_url,country,platform,metric,value,unit,period,value_type,source_name,source_url,notes]) => ({
  run_id: runId,candidate_id,competitor,role,store_url,entity_kind: competitor === "RebBull" ? "web_app" : (store_url ? "mobile_app" : "developer_platform"),
  country,platform,metric,value,unit,period,collected_at: collectedAt,value_type,source_name,source_url,notes
}));

const reviewThemes = [
  {candidate_id:"RBA-001",competitor:"TipRanks",theme_type:"pain",theme:"数据准确性与更新时间会直接破坏信任",review_count:3,period:"2021-2026",country:"美国",platform:"iOS/Web",source_url:sources.tipranksReviews,example_excerpt:"portfolio updates and balances can be stale or wrong",confidence:"medium"},
  {candidate_id:"RBA-001",competitor:"TipRanks",theme_type:"pain",theme:"付费墙重、试用与年费表达不清",review_count:2,period:"2021-2026",country:"美国",platform:"iOS/Web",source_url:sources.tipranksReviews,example_excerpt:"expected a trial but was billed for a year",confidence:"medium"},
  {candidate_id:"RBA-002",competitor:"Danelfin",theme_type:"pain",theme:"AI 分数短期波动，用户容易把概率误解为保证",review_count:1,period:"current reviews",country:"全球",platform:"Web",source_url:"https://www.trustpilot.com/review/danelfin.com",example_excerpt:"scores may move from 10 to Hold within a week",confidence:"low"},
  {candidate_id:"RBA-003",competitor:"同花顺问财",theme_type:"request",theme:"需要选择历史日期验证过去结论",review_count:1,period:"2021-07",country:"中国",platform:"iOS",source_url:sources.iwencai,example_excerpt:"希望能调整日期来验证往期数据",confidence:"medium"},
  {candidate_id:"RBA-001",competitor:"东方财富妙想",theme_type:"value",theme:"问答溯源、研报总结和自动图表可显著减少资料整理步骤",review_count:1,period:"current listing",country:"中国",platform:"iOS",source_url:sources.miaoxiang,example_excerpt:"问答全程溯源，点击即可查看",confidence:"high"},
  {candidate_id:"RBA-002",competitor:"TipRanks",theme_type:"value",theme:"用户认可把新闻、评分、研究与组合放在一个服务中",review_count:2,period:"2021-2023",country:"美国",platform:"iOS",source_url:sources.tipranksReviews,example_excerpt:"a good amount of resources rolled up into one site",confidence:"medium"}
].map(x => ({run_id:runId,...x}));

const run = {
  run_id: runId,
  created_at: "2026-07-28T16:17:45.773088+00:00",
  completed_at: collectedAt,
  mode: "competitor-expand",
  direction: "rebull-ai-stock-agent",
  status: "completed_with_anchor_access_gap",
  scope: {qualified_count:3, decision_contract:"max 3 SELECTED + 1 BACKUP + 1 WATCH", markets:["中国大陆","港股","美股"], platforms:["web_app","cross_platform"]},
  assumptions: [
    "将用户的“最多3+1+1”解释为最多3个正式主选、1个备选、1个观察项",
    "RebBull 登录被网络连接阻塞，因此只把用户描述、域名与公开可核验信息用于锚点分析",
    "未将任何第三方市场估算写成官方事实，也未把 App Store 评分数量写成 MAU 或留存"
  ],
  sources: Object.values(sources),
  source_inventory: {first_party:14,user_review_surfaces:3,observed_local_checks:3,paid_market_exports:0},
  counts: {discovered:10,ranked:5,deep_dives:5,selected:3,backup:1,watch:1,rejected:5}
};

const website = {
  run: {id:runId,date:"2026-07-29",mode:"competitor-expand",direction:"rebull-ai-stock-agent",status:run.status,freshness:"collected 2026-07-29",source_count:run.sources.length},
  summary: {scanned:10,ranked:5,deep_dive_count:5,selected:3,backup:1,watch:1,rejected:5},
  candidates,
  methodology: {scoring_version:"app-opportunity-scout-v1",gates:{selected_min_score:75,selected_min_completeness:0.8,selected_min_direct_competitors:3},estimate_notice:"No paid market-estimate dataset was used.",missing_data_notice:"RebBull VIP flow could not be accessed from the current network; no public RebBull API documentation was found."}
};

const report = `# RebBull 案例复刻创新与正式 App 选品报告

> Run: \`${runId}\`  
> 采集时间：2026-07-29（Asia/Singapore）  
> 模式：\`competitor-expand\`  
> 决策合同：最多 3 个 SELECTED + 1 个 BACKUP + 1 个 WATCH

## 1. 范围、假设与访问限制

本轮以 RebBull 为案例锚点，研究 AI 股票分析 Agent，但不把单一案例自动视为市场验证。账号文件仅用于已授权登录尝试；凭证、Cookie 和 Token 均未进入产物。

RebBull 在本工作环境的浏览器访问出现 \`ERR_CONNECTION_CLOSED\`，命令行 HTTPS 连接也超时，未进入登录页或 VIP 核心流程。公开 WHOIS 显示 \`rebull.cn\` 注册于 2026-06-29，距本次采集约 30 天；公开检索没有发现开发者文档、OpenAPI、SDK 或授权条款。因此本报告对 RebBull 的精确页面、实际模型、数据供应商和私有接口保持 \`unknown\`，不把推测写成实测。

## 2. RebBull 案例结论

### 可确认

- 用户给定定位：AI 分析股票的 Agent 工具，并已有 VIP 付费账户。
- 产品形态：Web 案例，域名 \`rebull.cn\`。
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

- [同花顺问财](${sources.iwencai})：自然语言选股、个股多维分析、事件预测和自选监控；App Store 当前为 4.5 分、730 个评分。评分数只作为使用代理，不等于 MAU 或留存。
- [东方财富妙想](${sources.miaoxiang})：问答溯源、研报总结、自动图表、宏观/行业/企业数据与行情跟踪。
- [TipRanks](${sources.tipranksApi})：评分、分析师观点、新闻、组合分析，并提供正式 API/MCP。
- [Danelfin](${sources.danelfinPricing})：AI Score、技术/基本面/情绪信号、组合和付费 API。
- [Fiscal.ai](${sources.fiscalSkills})：基于 as-filed 数据的研究工具、来源链接和 agent skills。

### 重复痛点

- 数据时点、持仓同步和余额错误会直接摧毁信任；
- AI 分数短期波动，但产品常没有充分解释概率、置信度和适用窗口；
- 付费墙重、试用边界和分层价格不清；
- 许多产品能总结，却不能重建“当时可知信息”或校准历史判断；
- 多市场的币种、会计口径、交易时间和证券实体难统一。

## 6. 推荐技术架构

\`\`\`text
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
\`\`\`

推荐采用“模型无关的工具层 + 可替换 LLM 路由”。核心护栏：

- 每个答案保留 \`as_of\`、来源 ID、抓取时间和计算版本；
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
| [Tushare Pro](${sources.tushareHttp}) | 需按套餐与条款授权 | A 股基础、行情、财务等；有 Python 与 HTTP API |
| JQData | 需商务授权 | A 股量化/基本面/宏观，商用展示与再分发需单独确认 |
| 交易所/公司公告 | 可直接使用原始事实，仍需遵守站点与版权规则 | 公告、财报与披露；适合作为一手事实层 |
| [SEC EDGAR](${sources.sec}) | 可直接使用公开 REST 数据，遵守访问规范 | 美股 filings、submissions、XBRL |
| [Alpha Vantage](${sources.alphaVantage}) | 需按免费/付费套餐与商用条款 | 行情、基本面、新闻情绪、技术指标 |
| [TipRanks API/MCP](${sources.tipranksApi}) | 可按公开配额试验；商用需付费/企业授权 | 评级、新闻、技术面、组合等 |
| [Danelfin API](${sources.danelfinPricing}) | 需付费授权 | AI Score、历史评分、组合相关数据 |
| [Fiscal.ai API](${sources.fiscal}) | 需按 API 计划授权 | 全球财务、KPIs、filings、来源链接 |

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

- ${sources.iwencai}
- ${sources.miaoxiang}
- ${sources.eastmoneyAi}
- ${sources.tipranksApp}
- ${sources.tipranksApi}
- ${sources.danelfinApp}
- ${sources.danelfinPricing}
- ${sources.danelfinMethod}
- ${sources.fiscal}
- ${sources.fiscalSkills}
- ${sources.simplywall}
- ${sources.composer}
- ${sources.composerApi}
- ${sources.tushare}
- ${sources.tushareHttp}
- ${sources.alphaVantage}
- ${sources.sec}
`;

function csvEscape(value) {
  const s = value == null ? "" : Array.isArray(value) ? value.join("|") : String(value);
  return /[",\n]/.test(s) ? `"${s.replaceAll('"','""')}"` : s;
}
function writeCsv(name, rows, headers) {
  fs.writeFileSync(path.join(dir,name), "\ufeff" + [headers.join(","), ...rows.map(r => headers.map(h => csvEscape(r[h])).join(","))].join("\n") + "\n");
}

fs.writeFileSync(path.join(dir,"run.json"), JSON.stringify(run,null,2)+"\n");
fs.writeFileSync(path.join(dir,"candidates.json"), JSON.stringify(candidates,null,2)+"\n");
fs.writeFileSync(path.join(dir,"evidence.json"), JSON.stringify(evidence,null,2)+"\n");
fs.writeFileSync(path.join(dir,"signals.json"), "[]\n");
fs.writeFileSync(path.join(dir,"website.json"), JSON.stringify(website,null,2)+"\n");
fs.writeFileSync(path.join(dir,"report.md"), report);

writeCsv("candidates.csv", candidates, [
  "run_id","candidate_id","name","name_zh","category","type","product_form","target_market","target_user","core_job",
  "source_engine","source_run_id","reference_gate_type","signal_ids","direct_competitor_count","data_completeness",
  "demand_score","growth_score","durability_score","usage_score","monetization_score","pain_score",
  "competitor_quality_score","ai_reuse_score","acquisition_score","total_score","route_score","route_rank",
  "route_methodology_version","confidence","decision","improvement_1","improvement_2","improvement_3","next_validation"
]);
writeCsv("evidence.csv", evidence, [
  "run_id","candidate_id","competitor","role","store_url","entity_kind","country","platform","metric","value","unit",
  "period","collected_at","value_type","source_name","source_url","notes"
]);
writeCsv("review-themes.csv", reviewThemes, [
  "run_id","candidate_id","competitor","theme_type","theme","review_count","period","country","platform","source_url","example_excerpt","confidence"
]);

console.log(JSON.stringify({runId, files: fs.readdirSync(dir).sort(), counts: run.counts}, null, 2));
