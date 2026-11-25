import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const runId = "2026-07-26-china-multi-platform-local-deals-rebate";
const at = "2026-07-26T22:10:00+08:00";
const store = (id) => `https://apps.apple.com/cn/app/id${id}`;

const candidates = [
  {
    run_id: runId, candidate_id: "MPR-01", name: "DealPilot（省钱决策台）",
    category: "Shopping / Local Deals", type: "utility", product_form: "mobile_app",
    target_market: "CN", target_user: "同时使用两个以上电商或本地生活平台的价格敏感用户",
    core_job: "比较已授权平台的券后价、预计返现、到账条件和风险并选择真实到手价最优方案",
    source_engine: "competitor_validated", source_run_id: runId, reference_gate_type: "direct_competitor",
    signal_ids: [], direct_competitor_count: 6, data_completeness: 0.72,
    demand_score: 19, growth_score: 0, durability_score: 8, usage_score: 0, monetization_score: 5,
    pain_score: 14, competitor_quality_score: 10, ai_reuse_score: 4, acquisition_score: 3,
    total_score: 63, route_score: 63, route_rank: 1, route_methodology_version: "app-opportunity-scout-v1",
    confidence: "medium", decision: "WATCH",
    improvement_1: "统一拆分平台券、补贴、支付优惠和我方预计返现",
    improvement_2: "下单前显示可返性、确认周期、退款和归因失败条件",
    improvement_3: "用返现状态机和证据包处理丢单、换货与申诉",
    next_validation: "取得美团和淘宝两家书面授权，完成各30-50笔小额订单和两个完整结算周期。",
  },
  {
    run_id: runId, candidate_id: "MPR-02", name: "RebateGuard（返现守卫）",
    category: "Shopping / Rebate Tracking", type: "utility", product_form: "mobile_app",
    target_market: "CN", target_user: "经常使用返利App但担心丢单、退款冲正和不到账的用户",
    core_job: "解释每笔返现为什么待确认、可提现或失效，并生成申诉证据",
    source_engine: "competitor_validated", source_run_id: runId, reference_gate_type: "direct_competitor",
    signal_ids: [], direct_competitor_count: 5, data_completeness: 0.64,
    demand_score: 16, growth_score: 0, durability_score: 7, usage_score: 0, monetization_score: 3,
    pain_score: 15, competitor_quality_score: 9, ai_reuse_score: 3, acquisition_score: 2,
    total_score: 55, route_score: 55, route_rank: 2, route_methodology_version: "app-opportunity-scout-v1",
    confidence: "medium", decision: "WATCH",
    improvement_1: "把联盟订单状态翻译成用户可理解的返现时间线",
    improvement_2: "自动整理订单、点击、核销、退款和客服证据",
    improvement_3: null,
    next_validation: "从淘粉吧等竞品采集近90天丢单/冲正评论，并用真实联盟沙箱验证状态映射。",
  },
  {
    run_id: runId, candidate_id: "MPR-03", name: "LocalDeal Optimizer（本地券优选）",
    category: "Local Deals", type: "utility", product_form: "mobile_app",
    target_market: "CN", target_user: "在美团、抖音和其他本地生活入口之间比较团购的消费者",
    core_job: "比较同店同套餐的券后价、预计返现和使用限制",
    source_engine: "competitor_validated", source_run_id: runId, reference_gate_type: "direct_competitor",
    signal_ids: [], direct_competitor_count: 4, data_completeness: 0.58,
    demand_score: 17, growth_score: 0, durability_score: 7, usage_score: 0, monetization_score: 2,
    pain_score: 13, competitor_quality_score: 8, ai_reuse_score: 4, acquisition_score: 3,
    total_score: 54, route_score: 54, route_rank: 3, route_methodology_version: "app-opportunity-scout-v1",
    confidence: "low", decision: "WATCH",
    improvement_1: "同店同套餐归一化后比较，不把相似套餐误当同款",
    improvement_2: "展示预约、时段、门店、退款和核销限制",
    improvement_3: "只纳入有正式授权和可追踪订单的平台",
    next_validation: "抖音生活服务取得书面授权前，只以美团+淘宝验证，不宣传三平台返现。",
  },
];

const competitors = [
  ["DouFan（豆返）","direct_competitor","mobile_app",store("6459108197"),"淘宝/京东/拼多多/抖音商品返利；美团/饿了么红包返利","A"],
  ["Shengqianjiang（省钱酱）","direct_competitor","mobile_app",store("1298543740"),"淘宝/京东/拼多多/抖音/美团/淘宝闪购","A"],
  ["ZhiFan（直返）","direct_competitor","mobile_app",store("6474171626"),"多电商、美团/饿了么；抖音高佣转链","A"],
  ["Taofen8（淘粉吧）","direct_competitor","mobile_app",store("527012586"),"淘宝/京东/抖音；美团/饿了么外卖返利","A"],
  ["Taofan Alliance（淘返联盟）","direct_competitor","mobile_app",store("1273170325"),"多电商、抖音、美团外卖、淘宝闪购、饿了么","B"],
  ["Miyuan（蜜源）","direct_competitor","mobile_app",store("1262351972"),"淘宝/京东/拼多多/抖音/美团/饿了么/点评等","B"],
  ["Gaosheng（高省）","direct_competitor","mobile_app",store("1584044872"),"多电商、抖音、美团、淘宝闪购","B"],
  ["Fanli（返利网）","adjacent_product","mobile_app",store("591584458"),"淘宝/京东/拼多多/美团/饿了么/携程","B"],
  ["Qingsongfan（轻松返）","direct_competitor","mobile_app",store("6695740999"),"声称淘宝/抖音/美团/饿了么等","C"],
  ["Rebate Robot（返利机器人）","direct_competitor","mobile_app",store("1535146403"),"版本记录含美团本地生活与抖音返利","C"],
];

const evidence = competitors.map((c, i) => ({
  run_id: runId, candidate_id: "MPR-01", competitor: c[0], role: c[1], store_url: c[3],
  country: "CN", platform: "iOS", metric: "declared_platform_coverage",
  value: c[4], unit: "text", period: "current store page", collected_at: at,
  value_type: "official", source_name: "Apple App Store", source_url: c[3],
  notes: `Evidence tier ${c[5]}; store claim does not prove every order is rebate-eligible.`,
  entity_kind: c[2],
}));
evidence.push(
  {
    run_id: runId, candidate_id: "MPR-01", competitor: "Meituan Alliance（美团联盟）",
    role: "platform_access", store_url: null, country: "CN", platform: "Web/API",
    metric: "third_party_rebate_access", value: "企业媒体登记、推广链接、订单回传、退款扣佣；官网提到让利于客",
    unit: "text", period: "current", collected_at: at, value_type: "official",
    source_name: "美团联盟", source_url: "https://union.meituan.com/",
    notes: "具体App返现、素材和订单级字段仍需书面确认。", entity_kind: "developer_platform",
  },
  {
    run_id: runId, candidate_id: "MPR-01", competitor: "Taobao Alliance（淘宝联盟）",
    role: "platform_access", store_url: null, country: "CN", platform: "Web/API",
    metric: "third_party_rebate_access", value: "支持App媒体备案；官方存在返利版本，可展示返利金额和比例",
    unit: "text", period: "current", collected_at: at, value_type: "official",
    source_name: "淘宝开放平台", source_url: "https://developer.alibaba.com/docs/doc.htm?articleId=119418&docType=1&treeId=129",
    notes: "返利版/会员运营属于定向或邀约权限。", entity_kind: "developer_platform",
  },
  {
    run_id: runId, candidate_id: "MPR-03", competitor: "Douyin Life Service CPS（抖音生活服务CPS）",
    role: "platform_access", store_url: null, country: "CN", platform: "Web/API",
    metric: "third_party_rebate_access", value: "公开CPS面向商家配置佣金计划及达人短视频/直播带货",
    unit: "text", period: "current", collected_at: at, value_type: "official",
    source_name: "抖音开放平台", source_url: "https://partner.open-douyin.com/docs/resource/zh-CN/mini-app/open-capacity/Industry/life/partner/CPS-guide",
    notes: "没有证据支持第三方消费者App全量团购转链和用户级返现。", entity_kind: "developer_platform",
  },
);

const themes = [
  ["MPR-01","Taofen8（淘粉吧）","pain","跨渠道领券导致订单归因丢失","需要近90天评论样本补证"],
  ["MPR-01","Taofen8（淘粉吧）","pain","换货被误判退款后返利扣回","需要真实订单复现"],
  ["MPR-01","ZhiFan（直返）","value","复制链接即可查看返利","近期公开评论支持"],
  ["MPR-01","DouFan（豆返）","value","无上下级、纯自用、返利透明","官方产品定位"],
  ["MPR-01","Zhekou Fanli（折扣返利）","pain","抖音链接跳转失败","说明平台接入稳定性是核心风险"],
].map((r) => ({
  run_id: runId, candidate_id: r[0], competitor: r[1], theme_type: r[2], theme: r[3],
  review_count: 1, period: "public store observation", country: "CN", platform: "iOS",
  source_url: r[1].startsWith("Zhekou") ? store("1460361504") : competitors.find((c) => c[0] === r[1])?.[3] ?? "",
  example_excerpt: r[4], confidence: "low",
}));

const candidateCols = ["run_id","candidate_id","name","category","type","product_form","target_market","target_user","core_job","source_engine","source_run_id","reference_gate_type","signal_ids","direct_competitor_count","data_completeness","demand_score","growth_score","durability_score","usage_score","monetization_score","pain_score","competitor_quality_score","ai_reuse_score","acquisition_score","total_score","route_score","route_rank","route_methodology_version","confidence","decision","improvement_1","improvement_2","improvement_3","next_validation"];
const evidenceCols = ["run_id","candidate_id","competitor","role","store_url","country","platform","metric","value","unit","period","collected_at","value_type","source_name","source_url","notes","entity_kind"];
const themeCols = ["run_id","candidate_id","competitor","theme_type","theme","review_count","period","country","platform","source_url","example_excerpt","confidence"];
const quote = (v) => {
  if (v === null || v === undefined) return "";
  const s = Array.isArray(v) ? JSON.stringify(v) : String(v);
  return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
};
const csv = (rows, cols) => "\uFEFF" + [cols.join(","), ...rows.map((r) => cols.map((c) => quote(r[c])).join(","))].join("\n") + "\n";

const summary = { discovered: 10, ranked: 3, deep_dives: 3, selected: 0, backup: 0, watch: 3, rejected: 0 };
const run = {
  run_id: runId, created_at: at, completed_at: at, mode: "competitor-expand",
  direction: "china-multi-platform-local-deals-rebate", status: "completed_authorization_gated",
  request: "调查中国App商店是否已有外部版抖省省，并验证美团、抖音、淘宝多平台接入与综合最优券方案。",
  scope: { country: ["CN"], store: ["Apple App Store"], competitor_count: 10, deep_dive_count: 3 },
  assumptions: ["商店文案只证明公开声称，不证明所有商品和订单均可返利。","平台接入以官方联盟文档和书面授权为准。"],
  sources: [...new Set(evidence.map((e) => e.source_url))], counts: summary,
};
const website = {
  run: { id: runId, date: "2026-07-26", mode: "competitor-expand", direction: "china-multi-platform-local-deals-rebate", status: run.status, freshness: at, source_count: run.sources.length },
  summary,
  candidates: candidates.map((c) => ({
    id: c.candidate_id, title: c.name.split("（")[0], titleZh: c.name.match(/（(.+)）/)?.[1] ?? "",
    score: c.total_score, decision: c.decision, confidence: c.confidence, productForm: c.product_form,
    targetUser: c.target_user, coreJob: c.core_job,
    improvements: [c.improvement_1,c.improvement_2,c.improvement_3].filter(Boolean),
    productBrief: { nextValidation: c.next_validation },
  })),
  competitors: competitors.map((c) => ({ name: c[0], relation: c[1], kind: c[2], storeUrl: c[3], coverage: c[4], evidenceTier: c[5] })),
  methodology: { scoring_version: "app-opportunity-scout-v1", estimate_notice: "App Store claims do not prove every order is eligible.", missing_data_notice: "Platform written approvals and real order tests are required before selection." },
};

fs.writeFileSync(path.join(dir, "run.json"), JSON.stringify(run, null, 2) + "\n");
fs.writeFileSync(path.join(dir, "candidates.json"), JSON.stringify(candidates, null, 2) + "\n");
fs.writeFileSync(path.join(dir, "candidates.csv"), csv(candidates, candidateCols));
fs.writeFileSync(path.join(dir, "evidence.json"), JSON.stringify(evidence, null, 2) + "\n");
fs.writeFileSync(path.join(dir, "evidence.csv"), csv(evidence, evidenceCols));
fs.writeFileSync(path.join(dir, "review-themes.csv"), csv(themes, themeCols));
fs.writeFileSync(path.join(dir, "website.json"), JSON.stringify(website, null, 2) + "\n");
fs.writeFileSync(path.join(dir, "signals.json"), "[]\n");
